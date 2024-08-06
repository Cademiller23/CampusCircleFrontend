import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { PollContext } from './PollContext'; // Adjust path if necessary

const PollItem = ({ poll }) => {
  const { userVotes, handlePollOptionSelect } = useContext(PollContext);
  console.log("userVotes:", userVotes);
  const hasVoted = Array.isArray(userVotes) && userVotes.some(vote => vote.poll_id === poll.id);

  const totalVotes = poll.options.reduce((sum, opt) => sum + opt.vote_count, 0);

  return (
    <View style={styles.pollContainer}>
      <Text style={styles.pollTitle}>{poll.title}</Text>

      {poll.options.map(option => {
        const fillPercentage = totalVotes ? (option.vote_count / totalVotes) * 100 : 0;
        return (
          <TouchableOpacity
            key={option.id}
            style={styles.pollOptionContainer}
            onPress={() => handlePollOptionSelect(poll.id, option.id)}
            disabled={hasVoted}
          >
            <Text style={styles.optionText}>{option.text}</Text>
            
            {/* Progress Bar */}
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${Math.min(fillPercentage, 100)}%` }]} />
            </View>

            <Text style={styles.voteCount}>{option.vote_count} votes</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};
const styles = StyleSheet.create({
  pollContainer: {
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    marginBottom: 20,
  },
  pollTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  pollOptionContainer: {
    marginVertical: 5,
  },
  progressBar: {
    height: 20,
    backgroundColor: '#e0e0e0',
    borderRadius: 10,
    overflow: 'hidden',
    marginVertical: 5,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#76c7c0',
  },
  optionText: {
    fontSize: 16,
    marginBottom: 5,
  },
  voteCount: {
    fontSize: 14,
    color: '#888',
  },
});

export default PollItem;