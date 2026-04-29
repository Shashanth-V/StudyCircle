import { useEffect, useState } from 'react';
import { useMatchStore } from '../../stores/matchStore';
import UserMatchCard from '../../components/cards/UserMatchCard';

export default function MatchesPage() {
  const [activeTab, setActiveTab] = useState('suggestions');
  const { 
    suggestions, matches, incomingRequests, outgoingRequests, isLoading,
    fetchSuggestions, fetchMatches, fetchRequests,
    sendRequest, acceptRequest, declineRequest
  } = useMatchStore();

  useEffect(() => {
    fetchSuggestions();
    fetchMatches();
    fetchRequests();
  }, [fetchSuggestions, fetchMatches, fetchRequests]);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Matches</h1>
          <p className="text-gray-500 dark:text-gray-400">Find study partners and manage requests</p>
        </div>
      </div>

      <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
        {[
          { id: 'suggestions', label: 'Discover' },
          { id: 'requests', label: 'Requests', count: incomingRequests.length },
          { id: 'matches', label: 'My Matches', count: matches.length }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id 
              ? 'border-primary-500 text-primary-600 dark:text-primary-400' 
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className="ml-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 py-0.5 px-2 rounded-full text-xs">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {activeTab === 'suggestions' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            <p className="col-span-full text-center py-12 text-gray-500">Loading suggestions...</p>
          ) : suggestions.length > 0 ? (
            suggestions.map(s => (
              <UserMatchCard 
                key={s.user._id} 
                suggestion={s} 
                onRequest={sendRequest} 
              />
            ))
          ) : (
            <p className="col-span-full text-center py-12 text-gray-500">No suggestions found right now.</p>
          )}
        </div>
      )}

      {activeTab === 'requests' && (
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Incoming Requests</h3>
            {incomingRequests.length === 0 ? (
              <p className="text-gray-500 text-sm">No incoming requests.</p>
            ) : (
              <div className="space-y-4">
                {incomingRequests.map(req => (
                  <div key={req._id} className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-4">
                      <img src={req.requester.profilePhoto || `https://ui-avatars.com/api/?name=${req.requester.name}`} className="w-12 h-12 rounded-full" alt="" />
                      <div>
                        <h4 className="font-bold dark:text-white">{req.requester.name}</h4>
                        <p className="text-sm text-gray-500">{req.requester.city || 'Remote'}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => acceptRequest(req._id)} className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium">Accept</button>
                      <button onClick={() => declineRequest(req._id)} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium">Decline</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Outgoing Requests</h3>
            {outgoingRequests.length === 0 ? (
              <p className="text-gray-500 text-sm">No outgoing requests.</p>
            ) : (
              <div className="space-y-4">
                {outgoingRequests.map(req => (
                  <div key={req._id} className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 opacity-70">
                    <div className="flex items-center gap-4">
                      <img src={req.receiver.profilePhoto || `https://ui-avatars.com/api/?name=${req.receiver.name}`} className="w-12 h-12 rounded-full" alt="" />
                      <h4 className="font-bold dark:text-white">{req.receiver.name}</h4>
                    </div>
                    <span className="text-sm font-medium text-amber-600 bg-amber-50 dark:bg-amber-900/30 px-3 py-1 rounded-full">Pending</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'matches' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {matches.length > 0 ? (
            matches.map(m => {
              const partner = m.requester._id === useMatchStore.getState().userId ? m.receiver : m.requester;
              return (
                <div key={m._id} className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-100 dark:border-gray-700 flex items-center gap-4 shadow-sm">
                  <img src={partner.profilePhoto || `https://ui-avatars.com/api/?name=${partner.name}`} className="w-14 h-14 rounded-full" alt="" />
                  <div className="flex-1">
                    <h4 className="font-bold dark:text-white">{partner.name}</h4>
                    <p className="text-sm text-gray-500 line-clamp-1">{partner.bio}</p>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="col-span-full text-center py-12 text-gray-500">You don't have any matches yet.</p>
          )}
        </div>
      )}
    </div>
  );
}
