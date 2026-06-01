import React from 'react'
import StoryDemoCard from './StoryDemoCard'

const StoryDemoCardSwitch = ({ storyDemo, onDeleteLiveDemo, hidden }) => {
  return <StoryDemoCard storyDemo={storyDemo} onDeleteLiveDemo={onDeleteLiveDemo} hidden={hidden} />
}

export default StoryDemoCardSwitch
