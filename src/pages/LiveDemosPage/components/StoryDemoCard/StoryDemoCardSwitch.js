import React from 'react'
import StoryDemoCard from './StoryDemoCard'

const StoryDemoCardSwitch = ({ storyDemo, onDeleteLiveDemo, onCloneLiveDemo, hidden }) => {
  return <StoryDemoCard storyDemo={storyDemo} onDeleteLiveDemo={onDeleteLiveDemo} onCloneLiveDemo={onCloneLiveDemo} hidden={hidden} />
}

export default StoryDemoCardSwitch
