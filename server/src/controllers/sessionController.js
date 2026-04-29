import { Session } from '../models/Session.js';
import { awardSessionXP } from '../utils/awardXP.js';
import { getIo } from '../socket/index.js';

export const getSessions = async (req, res, next) => {
  try {
    const { subject, status, mine, limit = 50 } = req.query;
    
    const query = {};
    if (status) query.status = status;
    if (subject) query.subject = new RegExp(subject, 'i');
    
    if (mine === 'true') {
      query.participants = req.user._id;
    } else {
      query.type = 'public';
    }

    const sessions = await Session.find(query)
      .populate('host', 'name profilePhoto')
      .populate('participants', 'name profilePhoto')
      .sort({ scheduledAt: 1 })
      .limit(parseInt(limit));

    res.json(sessions);
  } catch (error) {
    next(error);
  }
};

export const createSession = async (req, res, next) => {
  try {
    const sessionData = {
      ...req.body,
      host: req.user._id,
      participants: [req.user._id]
    };
    
    const session = new Session(sessionData);
    await session.save();

    const populated = await session.populate('host participants', 'name profilePhoto');
    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
};

export const getSessionById = async (req, res, next) => {
  try {
    const session = await Session.findById(req.params.id)
      .populate('host participants sessionChat.sender', 'name profilePhoto');
    if (!session) return res.status(404).json({ message: 'Session not found' });
    res.json(session);
  } catch (error) {
    next(error);
  }
};

export const joinSession = async (req, res, next) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ message: 'Session not found' });
    
    if (session.participants.length >= session.maxParticipants) {
      return res.status(400).json({ message: 'Session is full' });
    }

    if (!session.participants.includes(req.user._id)) {
      session.participants.push(req.user._id);
      await session.save();
      
      const io = getIo();
      if (io) {
        const user = await req.user.populate('profilePhoto name');
        io.to(`session_${session._id}`).emit('session_user_joined', {
          _id: user._id, name: user.name, profilePhoto: user.profilePhoto
        });
      }
    }

    res.json(session);
  } catch (error) {
    next(error);
  }
};

export const leaveSession = async (req, res, next) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ message: 'Session not found' });

    session.participants = session.participants.filter(p => p.toString() !== req.user._id.toString());
    
    if (session.participants.length === 0) {
      session.status = 'ended';
    } else if (session.host.toString() === req.user._id.toString()) {
      session.host = session.participants[0]; // transfer host
    }

    await session.save();
    res.json(session);
  } catch (error) {
    next(error);
  }
};

export const startSession = async (req, res, next) => {
  try {
    const session = await Session.findOne({ _id: req.params.id, host: req.user._id });
    if (!session) return res.status(404).json({ message: 'Session not found or not authorized' });

    session.status = 'live';
    await session.save();
    res.json(session);
  } catch (error) {
    next(error);
  }
};

export const endSession = async (req, res, next) => {
  try {
    const session = await Session.findOne({ _id: req.params.id, host: req.user._id });
    if (!session) return res.status(404).json({ message: 'Session not found or not authorized' });

    session.status = 'ended';
    
    // Calculate total minutes studied roughly based on scheduled vs now
    const now = new Date();
    const start = new Date(session.scheduledAt);
    const diffMins = Math.floor((now - start) / 60000);
    session.totalMinutesStudied = diffMins > 0 ? diffMins : 0;
    
    await session.save();

    await awardSessionXP(session);

    res.json(session);
  } catch (error) {
    next(error);
  }
};

export const addSessionChat = async (req, res, next) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ message: 'Session not found' });

    const msg = {
      sender: req.user._id,
      text: req.body.text,
      createdAt: new Date()
    };

    session.sessionChat.push(msg);
    await session.save();

    const populatedMsg = { ...msg, sender: { _id: req.user._id, name: req.user.name, profilePhoto: req.user.profilePhoto } };

    const io = getIo();
    if (io) {
      io.to(`session_${session._id}`).emit('session_chat_message', populatedMsg);
    }

    res.status(201).json(populatedMsg);
  } catch (error) {
    next(error);
  }
};
