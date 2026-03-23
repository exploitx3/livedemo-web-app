import React from 'react'
import { ACTIONS, EVENTS, STATUS } from 'react-joyride'
import styled from 'styled-components'

const stepsPath = /\//

let addSelfDestructingEventListener = (element, eventType, callback) => {
  if (element) {
    let handler = () => {
      callback()
      if (element) {
        element.removeEventListener(eventType, handler)
      }
    }

    element.addEventListener(eventType, handler)

  }
}

function addClass(query, className) {
  let workspaceMenuChildsRemove = document.querySelector(query)
  if (workspaceMenuChildsRemove) {
    workspaceMenuChildsRemove.classList.add(className)
  }
}

function removeClass(query, className) {
  let workspaceMenuChildsRemove = document.querySelector(query)
  if (workspaceMenuChildsRemove) {
    workspaceMenuChildsRemove.classList.remove(className)
  }
}

function waitForElement(query, refreshRate, limit) {
  return new Promise((resolve, reject) => {

    let counter = 0

    let looper = setInterval(() => {
      let elem = document.querySelector(query)
      if (elem) {

        clearInterval(looper)
        resolve(elem)
      }

      if (counter >= limit) {
        reject(new Error('limit reached - still cannot find element'))
      }
      counter += 1

    }, refreshRate)

  })


}

function callbackClosure(actions) {
  const { endWalkthrough, changeStep, changeProp } = actions
  return (data) => {
    const { action, index, type, status } = data

    // initial setup
    if (action === 'start' && index === 0) {
      let firstWorkspaceFromMenuCheck = document.querySelector('.workspaceSubMenu > ul > li:first-child')

      if (!firstWorkspaceFromMenuCheck) {
        document.querySelector('.workspaceSubMenu > .ant-menu-submenu-title').click()
      }
    }

    const finishedStatuses = [STATUS.FINISHED, STATUS.SKIPPED]

    if (finishedStatuses.includes(status)) {
      endWalkthrough()
    } else if (([EVENTS.TOOLTIP_CLOSE, EVENTS.TOUR_END]).includes(type)) {
      endWalkthrough()
      // } else if ([ACTIONS.CLOSE].includes(action)) {
      //   if(![1, 5,8].includes(index)){
      //     endWalkthrough()
      //   }
      //   changeStep(stepsPath, index + 1 )

    } else if (([EVENTS.STEP_AFTER, EVENTS.TARGET_NOT_FOUND]).includes(type)) {
      const nextStepIndex = index + (action === ACTIONS.PREV ? -1 : 1)


      switch (nextStepIndex) {
        case 1:
          let clickWorkspaceFunc = (event) => {
            let counter = 0
            let looper = setInterval(() => {

              if (document.querySelector('#info-column')) {
                changeStep(stepsPath, 2)
                removeClass('.workspaceSubMenu > ul > li:first-child > ul', 'hide')
                removeClass('.workspaceSubMenu > ul > li:first-child', 'highlight')
                clearInterval(looper)
              }

              if (counter >= 50) {
                removeClass('.workspaceSubMenu > ul > li:first-child > ul', 'hide')
                removeClass('.workspaceSubMenu > ul > li:first-child', 'highlight')
                clearInterval(looper)
              }
              counter += 1

            }, 500)
          }

          let firstWorkspaceFromMenu = document.querySelector('.workspaceSubMenu > ul > li:first-child')


          if (!firstWorkspaceFromMenu) {
            document.querySelector('.workspaceSubMenu > .ant-menu-submenu-title').click()
            setTimeout(() => {


              firstWorkspaceFromMenu = document.querySelector('.workspaceSubMenu > ul > li:first-child')
              addSelfDestructingEventListener(firstWorkspaceFromMenu, 'click', clickWorkspaceFunc)
              // to make sure only workspace menu name is visible, without the childs
              addClass('.workspaceSubMenu > ul > li:first-child > ul', 'hide')
              addClass('.workspaceSubMenu > ul > li:first-child', 'highlight')
            }, 1500)

          } else {
            // to make sure only workspace menu name is visible, without the childs
            addClass('.workspaceSubMenu > ul > li:first-child > ul', 'hide')
            addClass('.workspaceSubMenu > ul > li:first-child', 'highlight')

            if (firstWorkspaceFromMenu) {
              addSelfDestructingEventListener(firstWorkspaceFromMenu, 'click', clickWorkspaceFunc)
            }

          }


          break
        case 2:
          if (action === ACTIONS.CLOSE) {
            setTimeout(() => {
              
              let firstWorkspaceFromMenu = document.querySelector('.ant-menu-submenu .ant-menu-submenu > .ant-menu-submenu-title')
              firstWorkspaceFromMenu.click()

            }, 200)
          }
          break
        case 3:
          let workspaceMenuChildsRemove = document.querySelector('.workspaceSubMenu > ul > li:first-child > ul')
          if (workspaceMenuChildsRemove) {
            workspaceMenuChildsRemove.classList.remove('hide')
          }
          break
        case 4:
          changeProp({ disableScrolling: false })
          break
        case 5:

          let channelButton = document.querySelector('#workspace-channels-col > div > div > div > ul > li:nth-child(9)')
          document.querySelector("#workspace-channels-col > div > div > div > ul > li:nth-child(9)> button").setAttribute("disabled", "true")

          addSelfDestructingEventListener(channelButton, 'click', () => {
            changeProp({ disableOverlay: true, disableScrolling: false })

            waitForElement('#chat-container', 500, 50)
              .then(() => {
                
                changeProp({ disableOverlay: false, disableScrolling: false })
                changeStep(stepsPath, nextStepIndex + 1)

              })
              .catch((err) => {
                console.log(err)

              })
          })
          break
        case 6:

          changeProp({ disableOverlay: true, disableScrolling: false })

          if (action === ACTIONS.CLOSE) {
            setTimeout(() => {
              
              let aHrefChannel = document.querySelector('#workspace-channels-col > div > div > div > ul > li:nth-child(9) .ant-list-item-meta-title > a')
              aHrefChannel.click()
            }, 200)
          }
          break

        case 8:


          let analysisButton = document.querySelector('#analysis-channel-btn')
          addSelfDestructingEventListener(analysisButton, 'click', () => {
            changeProp({ disableOverlay: false, disableScrolling: false })

            waitForElement('.ant-tabs-content', 500, 50)
              .then(() => {
                
                changeStep(stepsPath, nextStepIndex + 1)

              })
              .catch((err) => {
                console.log(err)

              })
          })
          break

        case 9:

          if (action === ACTIONS.CLOSE) {
            setTimeout(() => {
              
              let analysisButtonAutoClick = document.querySelector('#analysis-channel-btn')
              analysisButtonAutoClick.click()

            }, 200)
          }
          break;

      }

      if (action === ACTIONS.CLOSE &&
        [1, 5, 8].includes(index)) {

        // endWalkthrough()
        endWalkthrough()
      } else {
        changeStep(stepsPath, nextStepIndex)
      }
    }
    // if (sidebarOpen && index === 0) {
    //   setTimeout(() => {
    //     this.setState({ run: true });
    //   }, 400);
    // } else if (sidebarOpen && index === 1) {
    //   this.setState(
    //     {
    //       run: false,
    //       sidebarOpen: false,
    //       stepIndex,
    //     },
    //     () => {
    //       setTimeout(() => {
    //         this.setState({ run: true });
    //       }, 400);
    //     },
    //   );
    // } else if (index === 2 && action === ACTIONS.PREV) {
    //   this.setState(
    //     {
    //       run: false,
    //       sidebarOpen: true,
    //       stepIndex,
    //     },
    //     () => {
    //       setTimeout(() => {
    //         this.setState({ run: true });
    //       }, 400);
    //     },
    //   );
    // } else {
    //   // Update state to advance the tour
    //   this.setState({
    //     sidebarOpen: false,
    //     stepIndex,
    //   });
    // }


    // // tslint:disable:no-console
    // console.groupCollapsed(type);
    // console.log(data);
    // console.groupEnd();
    // // tslint:enable:no-console

  }
}

const S = {
  Title: styled.h1`
    font-size: 1.4em;
    font-family: 'Baloo Chettan 2', cursive;

  `
}

function titleFormatter(titleStr) {
  return <S.Title>{titleStr}</S.Title>
}

export default {
  stepsPath,
  steps: [
    {
      content: (
        <div>
          This is the workspace Dashboard
          <br/>
          Contains all of your Workspaces!
        </div>
      ),
      disableBeacon: true,
      // disableOverlayClose: true,
      hideCloseButton: true,
      // hideFooter: true,
      placement: 'bottom',
      spotlightClicks: true,
      styles: {
        options: {
          zIndex: 10000,
        },
      },
      target: '#dashboard-container',
      title: titleFormatter('Tutorial'),
    },
    {
      content: 'Select your workspace from the Menu',
      placement: 'right-start',
      spotlightPadding: 0,
      disableBeacon: true,
      hideCloseButton: false,
      hideFooter: false,
      styles: {
        options: {
          zIndex: 10000,

        },
      },
      target: '.workspaceSubMenu > ul',
      title: titleFormatter('Sidebar'),
    },
    // {
    //   content: 'This is your Workspace Info',
    //   placement: 'right-start',
    //   disableBeacon: true,
    //   // disableOverlayClose: true,
    //   hideCloseButton: true,
    //   spotlightClicks: true,
    //   styles: {
    //     options: {
    //       zIndex: 10000,
    //
    //     },
    //   },
    //   target: '#info-column',
    //   title: titleFormatter('Info'),
    // },
    // {
    //   content: (
    //     <div>
    //       Those are your Amazing
    //       <br/>
    //       Workspace Members
    //     </div>
    //   ),
    //   disableBeacon: true,
    //   // disableOverlayClose: true,
    //   hideCloseButton: true,
    //   // hideFooter: true,
    //   disableScrolling: false,
    //   placement: 'right-start',
    //   spotlightClicks: true,
    //   styles: {
    //     options: {
    //       width: '250px',
    //       zIndex: 10000,
    //     },
    //   },
    //   target: '#workspace-members-col',
    //   title: titleFormatter('Workspace Members')
    // },
    // {
    //   content: (
    //     <div>
    //       Here are your Workspace Channels.
    //     </div>
    //   ),
    //   disableBeacon: true,
    //   // disableOverlayClose: true,
    //   hideCloseButton: true,
    //   // hideFooter: true,
    //   placement: 'left-start',
    //   disableScrolling: false,
    //
    //   spotlightClicks: true,
    //   styles: {
    //     options: {
    //       zIndex: 10000,
    //     },
    //   },
    //   target: '#workspace-channels-col',
    //   title: titleFormatter('Channels')
    // },
    // {
    //   content: (
    //     <div>
    //       Click to see this channel
    //     </div>
    //   ),
    //   disableBeacon: true,
    //   // disableOverlayClose: true,
    //   hideCloseButton: true,
    //   hideFooter: true,
    //   disableScrolling: false,
    //   placement: 'left-start',
    //   spotlightClicks: true,
    //   styles: {
    //     options: {
    //       zIndex: 10000,
    //     },
    //   },
    //   target: '#workspace-channels-col > div > div > div > ul > li:nth-child(9)',
    //   title: titleFormatter('Check it out')
    // },
    // {
    //   content: (
    //     <div>
    //       Here you can find your message history
    //     </div>
    //   ),
    //   disableBeacon: true,
    //   // disableOverlayClose: true,
    //   hideCloseButton: true,
    //   hideFooter: false,
    //   disableScrolling: false,
    //   placement: 'center',
    //   hideBackButton: true,
    //   spotlightClicks: true,
    //   styles: {
    //     options: {
    //       zIndex: 10000,
    //       height: '20px',
    //       maxHeight: '20px',
    //       width: '300px'
    //     },
    //   },
    //   target: 'body',
    //   title: titleFormatter('Channel History')
    //
    // },
    // {
    //   content: (
    //     <div>
    //       This is the search which you can use to search for your messages
    //     </div>
    //   ),
    //   disableBeacon: true,
    //   // disableOverlayClose: true,
    //   hideCloseButton: true,
    //   hideFooter: false,
    //   disableScrolling: false,
    //   placement: 'top',
    //   spotlightClicks: true,
    //   styles: {
    //     options: {
    //       zIndex: 10000,
    //
    //     },
    //   },
    //   target: '#channel-footer',
    //   title: titleFormatter('Search')
    // },
    // {
    //   content: (
    //     <div>
    //       Click here to see the Emotion Analysis of this channel
    //     </div>
    //   ),
    //   disableBeacon: true,
    //   // disableOverlayClose: true,
    //   hideCloseButton: true,
    //   hideFooter: true,
    //   disableScrolling: false,
    //   placement: 'bottom',
    //   spotlightClicks: true,
    //   styles: {
    //     options: {
    //       zIndex: 10000,
    //
    //     },
    //   },
    //   target: '#analysis-channel-btn',
    //   title: titleFormatter('Emotion Analysis')
    // },
    // {
    //   content: (
    //     <div>
    //       Here you can see the Emotion Analysis Chart generated from the channel messages.
    //     </div>
    //   ),
    //   disableBeacon: true,
    //   // disableOverlayClose: true,
    //   hideCloseButton: true,
    //   hideFooter: false,
    //   disableScrolling: false,
    //   placement: 'top',
    //   spotlightClicks: true,
    //   styles: {
    //     options: {
    //       zIndex: 10000,
    //
    //     },
    //   },
    //   target: '.ant-tabs-content',
    //   title: titleFormatter('Emotion Analysis - Chart')
    // }
  ],
  callbackClosure
}


/*

    {
      content: 'This is our sidebar, you can find everything you need here',
      placement: 'right',
      spotlightPadding: 0,
      styles: {
        options: {
          zIndex: 10000,
        },
      },
      // target: this.sidebar!,
      title: 'Sidebar',
    },
    {
      content: 'Check the availability of the team!',
      placement: 'bottom',
      styles: {
        options: {
          zIndex: 10000,
        },
      },
      // target: this.calendar!,
      title: 'The schedule',
    }
 */
