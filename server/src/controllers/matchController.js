import { Match } from '../models/Match.js';
import { User } from '../models/User.js';
import { calculateMatchScore } from '../utils/matchScore.js';

export const getSuggestions = async (req, res, next) => {
  try {
    const { subject, level, city, minScore } = req.query;
    const currentUser = req.user;

    // Users to exclude: self, and anyone already in a match relationship (pending/accepted/blocked/declined)
    const existingMatches = await Match.find({
      $or: [{ requester: currentUser._id }, { receiver: currentUser._id }]
    });
    
    const excludeIds = [currentUser._id.toString()];
    existingMatches.forEach(m => {
      excludeIds.push(m.requester.toString());
      excludeIds.push(m.receiver.toString());
    });

    const query = {
      _id: { $nin: excludeIds },
      onboardingComplete: true
    };

    if (city) query.city = new RegExp(city, 'i');
    if (subject) query['subjects.name'] = new RegExp(subject, 'i');
    if (level) query['subjects.level'] = level;

    // Optimization: find users who share at least one subject
    const mySubjectNames = currentUser.subjects.map(s => s.name);
    if (mySubjectNames.length > 0 && !subject) {
      query['subjects.name'] = { $in: mySubjectNames.map(n => new RegExp(`^${n}$`, 'i')) };
    }

    const potentialMatches = await User.find(query).limit(50);
    
    const scoredMatches = potentialMatches.map(userB => {
      const { score, breakdown, mutualSubjects } = calculateMatchScore(currentUser, userB);
      return {
        user: {
          _id: userB._id,
          name: userB.name,
          profilePhoto: userB.profilePhoto,
          city: userB.city,
          studyStyle: userB.studyStyle,
          bio: userB.bio,
          subjects: userB.subjects,
          availability: userB.availability
        },
        score,
        breakdown,
        mutualSubjects
      };
    });

    const threshold = parseInt(minScore) || 0;
    const filteredAndSorted = scoredMatches
      .filter(m => m.score >= threshold)
      .sort((a, b) => b.score - a.score);

    res.json({ data: filteredAndSorted });
  } catch (error) {
    next(error);
  }
};

export const createRequest = async (req, res, next) => {
  try {
    const receiverId = req.params.userId;
    const requester = req.user;

    const existing = await Match.findOne({
      $or: [
        { requester: requester._id, receiver: receiverId },
        { requester: receiverId, receiver: requester._id }
      ]
    });

    if (existing) return res.status(400).json({ message: 'Match relationship already exists' });

    const receiverUser = await User.findById(receiverId);
    if (!receiverUser) return res.status(404).json({ message: 'User not found' });

    const { score, breakdown, mutualSubjects } = calculateMatchScore(requester, receiverUser);

    const match = new Match({
      requester: requester._id,
      receiver: receiverId,
      matchScore: score,
      breakdown,
      mutualSubjects,
      status: 'pending'
    });

    await match.save();

    // Create Notification stub
    // await createNotification({ userId: receiverId, type: 'match_request', fromUser: requester._id, refId: match._id });

    res.status(201).json(match);
  } catch (error) {
    next(error);
  }
};

export const getIncomingRequests = async (req, res, next) => {
  try {
    const matches = await Match.find({ receiver: req.user._id, status: 'pending' })
      .populate('requester', 'name profilePhoto city subjects studyStyle bio');
    res.json(matches);
  } catch (error) {
    next(error);
  }
};

export const getOutgoingRequests = async (req, res, next) => {
  try {
    const matches = await Match.find({ requester: req.user._id, status: 'pending' })
      .populate('receiver', 'name profilePhoto city subjects studyStyle bio');
    res.json(matches);
  } catch (error) {
    next(error);
  }
};

export const getMatches = async (req, res, next) => {
  try {
    const matches = await Match.find({
      $or: [{ requester: req.user._id }, { receiver: req.user._id }],
      status: 'accepted'
    }).populate('requester receiver', 'name profilePhoto city subjects studyStyle bio lastActive');
    res.json(matches);
  } catch (error) {
    next(error);
  }
};

export const acceptRequest = async (req, res, next) => {
  try {
    const match = await Match.findOne({ _id: req.params.id, receiver: req.user._id, status: 'pending' });
    if (!match) return res.status(404).json({ message: 'Match request not found' });

    match.status = 'accepted';
    await match.save();

    // Create Chat stub
    // await createChat(match.requester, match.receiver);
    
    // Notification stub
    // await createNotification({ userId: match.requester, type: 'match_accepted', fromUser: req.user._id, refId: match._id });

    res.json(match);
  } catch (error) {
    next(error);
  }
};

export const declineRequest = async (req, res, next) => {
  try {
    const match = await Match.findOne({ _id: req.params.id, receiver: req.user._id, status: 'pending' });
    if (!match) return res.status(404).json({ message: 'Match request not found' });

    match.status = 'declined';
    await match.save();
    res.json(match);
  } catch (error) {
    next(error);
  }
};
