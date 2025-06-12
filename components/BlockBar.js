import React from 'react';
import { View } from 'react-native';

const BlockBar = ({ percentage, blocks = 10, filledColor = "#4A90E2", emptyColor = "#eee", size = 18, gap = 4 }) => {
  const filledBlocks = Math.round((percentage / 100) * blocks);
  return (
    <View style={{ flexDirection: 'row', marginVertical: 8 }}>
      {Array.from({ length: blocks }).map((_, i) => (
        <View
          key={i}
          style={{
            width: size,
            height: size,
            marginRight: i < blocks - 1 ? gap : 0,
            borderRadius: 4,
            backgroundColor: i < filledBlocks ? filledColor : emptyColor,
          }}
        />
      ))}
    </View>
  );
};

export default BlockBar;