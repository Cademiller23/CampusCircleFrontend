import React, { createContext, useState } from 'react';
import { Alert } from 'react-native';

const PollContext = createContext();

const PollProvider = ({ children }) => {
  const [userVotes, setUserVotes] = useState([]);
  const [polls, setPolls] = useState([]);

  const handlePollOptionSelect = async (pollId, optionId) => {
    try {
        const response = await fetch(`http://campus-circle.net/vote_poll/${pollId}/${optionId}`, { method: 'POST' });
        if (response.ok) {
            const updatedPoll = await response.json();

            setPolls(prevPolls => {
                const updatedPolls = prevPolls.map(poll => {
                    if (poll.id === pollId) {
                        // Update the vote count for the selected option
                        return {
                            ...poll,
                            options: poll.options.map(option => 
                                option.id === optionId 
                                ? { ...option, vote_count: option.vote_count + 1 }
                                : option
                            )
                        };
                    }
                    return poll;
                });
                return updatedPolls;
            });

            // Update the user votes
            setUserVotes(prevVotes => ({ ...prevVotes, [pollId]: optionId }));
        } else {
            Alert.alert('Error', 'Failed to register vote. Please try again.');
        }
    } catch (error) {
        console.error('Error voting on poll:', error);
        Alert.alert('Error', 'Failed to register vote. Please try again.');
    }
};
  return (
    <PollContext.Provider value={{ polls, setPolls, userVotes, handlePollOptionSelect }}>
      {children}
    </PollContext.Provider>
  );
};

export { PollContext, PollProvider };