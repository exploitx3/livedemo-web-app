import {toast} from 'react-toastify'
import WorkspaceMemberRoles from '../constants/WorkspaceMemberRoles.js'
import {Text} from 'slate'


var chrome = chrome

let chromeRuntimeExists = false

if (chrome) {
  chromeRuntimeExists = true
}


export function capitalize(string) {
  return string[0].toUpperCase() + string.slice(1)
}

export function findTopWorkspaceMember(userWorkspaceMembers, workspace) {

  userWorkspaceMembers = JSON.parse(JSON.stringify(userWorkspaceMembers))
  let userTopWorkspaceMember = {}
  if (userWorkspaceMembers && userWorkspaceMembers.length !== 0) {
    userTopWorkspaceMember = userWorkspaceMembers.filter(member => member.workspaceId.toString() === workspace._id.toString())
      .sort(sortWorkspaceMembersByOwnerAndAdmin)[0] || {}

    userTopWorkspaceMember = workspace.members.find(member => member._id === userTopWorkspaceMember._id)
  }

  return userTopWorkspaceMember
}

export function sortWorkspaceMembersByOwnerAndAdmin(first, second) {
  if (first.slackIsPrimaryOwner) {
    return -1
  } else if (second.slackIsPrimaryOwner) {
    return 1
  } else if (first.role === WorkspaceMemberRoles.OWNER) {
    return -1
  } else if (second.role === WorkspaceMemberRoles.OWNER) {
    return 1
  } else if (first.role === WorkspaceMemberRoles.ADMIN) {
    return -1
  } else if (second.role === WorkspaceMemberRoles.ADMIN) {
    return 1
  } else {
    return 0
  }
}

export function showErrorsForResponse(error) {
  console.log(error)
  let errorsMsgsArray = []

  // Handle cases where error.response might not exist
  if (!error.response || !error.response.data) {
    const errorMessage = error.message || 'An error occurred'
    toast.error(errorMessage)
    return
  }

  if (error.response.data.error) {
    errorsMsgsArray.push(error.response.data.error)
  } else if (error.response.data.errors) {
    Object.entries(error.response.data.errors).forEach(([key, value]) => errorsMsgsArray.push(value))
  } else {
    // Fallback to a generic error message
    const errorMessage = error.response.data.message || 'An error occurred'
    errorsMsgsArray.push(errorMessage)
  }

  for (let i = 0; i < errorsMsgsArray.length; i++) {
    toast.error(errorsMsgsArray[i])
  }
}

export function showSuccessfulMessage(message) {
  toast.success(message)
}

export function showInfoMessage(message) {
  toast.info(message)
}

export function showErrorMessage(message) {
  toast.error(message)
}


export function addMemberMentionsToText(msgText, channelMembersBySlackId) {


  let result = msgText.replace(/(<@(.+?)>)/g, function (match, firstGroup, secondGroup) {

    let member = channelMembersBySlackId[secondGroup]
    if (!member) {
      return firstGroup
    } else {


      return `<span class="mention" onclick="window.history.reactPushState('/members/${member._id}')">${member.profile.displayName || member.profile.realName || member.name}</span>`
    }
  })
  return result
}

export function addChannelMentionsToText(msgText, channelDocsBySlackId) {


  let result = msgText.replace(/(<#(.+?)\|.+?>)/g, function (match, firstGroup, secondGroup) {

    let channel = channelDocsBySlackId[secondGroup]
    if (!channel) {
      return firstGroup
    } else {


      return `<span class="channel-mention" onclick="window.history.reactPushState('/workspaces/${channel.workspaceId}/channels/${channel._id}')">${channel.name}</span>`
    }
  })
  return result
}

export function addLinksToText(msgText) {


  let result = msgText.replace(/<(http.*?)>/g, function (match, firstGroup) {
    let splitGroup = firstGroup.split("|")
    let url = firstGroup
    let text = firstGroup

    if (splitGroup.length !== 1) {
      url = splitGroup[0]
      text = splitGroup[1]
    }

    return `<a href="${url}" class="text_link" target="_blank" rel="noopener noreferrer">${text}</a>`

  })
  return result
}

export function addNewLineToText(msgText) {


  let result = msgText.replace(/\n/g, function (match) {
    return '<br>'
  })

  return result
}

export function getMemberName(member) {
  return ((member.profile &&
    (member.profile.displayName || member.profile.realName)) || member.name)
}

export function mapValue(value, startRange, endRange, startTarget, endTarget) {

  // let valueInRange = value - startRange
  // let valueMinMax = Math.max(Math.min(valueInRange, endRange), startRange)
  // let maxRange = endRange - startRange

  let result = (value - startRange) * (endTarget - startTarget) / (endRange - startRange) + startTarget

  return result
}


export function encodeBase64(str) {
  return window.btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function (match, p1) {
    return String.fromCharCode(parseInt(p1, 16))
  }))
}


export function decodeBase64(str) {
  return decodeURIComponent(Array.prototype.map.call(window.atob(str), function (c) {
    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
  }).join(''))
}


export const getNode = ({element, children}) => {
  switch (element.type) {
    case 'quote':
      // the plugin may have an optional parameter for the wrapping tag, default to blockquote
      return `<blockquote>${children}</blockquote>`;
    case 'paragraph':
      return `<p>${children}</p>`;
    case 'link':
      return `<a href="${encodeURI(element.url)}">${children}</a>`;
    case 'heading-one':
      return `<h1>${children}</h1>`;
    case 'heading-two':
      return `<h2>${children}</h2>`;
    case 'heading-three':
      return `<h3>${children}</h3>`;
    case 'heading-four':
      return `<h4>${children}</h4>`;
    case 'heading-five':
      return `<h5>${children}</h5>`;
    case 'heading-six':
      return `<h6>${children}</h6>`;
    case 'numbered-list':
      return `<ol>${children}</ol>`;
    case 'bulleted-list':
      return `<ul>${children}</ul>`;
    case 'list-item':
      return `<li>${children}</li>`;
    case 'header':
      return `<header>${children}</header>`;
    case 'section':
      return `<section>${children}</section>`;
    case 'table':
      return `<table>${children}</table>`;
    case 'thead':
      return `<thead>${children}</thead>`;
    case 'tbody':
      return `<tbody>${children}</tbody>`;
    case 'table-header':
      return `<th>${children}</th>`;
    case 'table-row':
      return `<tr>${children}</tr>`;
    case 'table-cell':
      return `<td>${children}</td>`;
    case 'code':
      return `<pre>${children}</pre>`;
    case 'image':
      return `<img src="${encodeURI(element.url)}">${children}</img>`;
    default:
      return children;
  }
};


/*
    A: el => ({ type: 'link', url: el.getAttribute('href') }),
    BLOCKQUOTE: () => ({ type: 'quote' }),
    H1: () => ({ type: 'heading-one' }),
    H2: () => ({ type: 'heading-two' }),
    H3: () => ({ type: 'heading-three' }),
    H4: () => ({ type: 'heading-four' }),
    H5: () => ({ type: 'heading-five' }),
    H6: () => ({ type: 'heading-six' }),
    IMG: el => ({ type: 'image', url: el.getAttribute('src') }),
    LI: () => ({ type: 'list-item' }),
    OL: () => ({ type: 'numbered-list' }),
    P: () => ({ type: 'paragraph' }),
    PRE: () => ({ type: 'code' }),
    UL: () => ({ type: 'bulleted-list' }),
    TABLE: () => ({ type: 'table' }),
    TBODY: () => ({ type: 'tbody' }),
    THEAD: () => ({ type: 'thead' }),
    TR: () => ({ type: 'table-row' }),
    TD: () => ({ type: 'table-cell' }),
    TH: () => ({ type: 'table-cell-header' }),
    HEADER: () => ({ type: 'header' }),
    SECTION: () => ({ type: 'section' }),
 */

export const getLeaf = ({leaf, children}) => {
  let newChildren = children;
  if (leaf.bold) {
    newChildren = `<strong>${newChildren}</strong>`;
  }
  if (leaf.italic) {
    newChildren = `<i>${newChildren}</i>`;
  }
  if (leaf.underline) {
    newChildren = `<u>${newChildren}</u>`;
  }

  //Handle line-breaks
  newChildren = newChildren.replace(new RegExp('\r?\n','g'), '<br />');

  if(newChildren === ""){
    return '<br />'
  }

  return newChildren;
};

// should iterate over the plugins, see htmlDeserialize
export const htmlSerialize = (nodes) => {

  return nodes.map((node) => {
    if (Text.isText(node)) {
      return getLeaf({leaf: node, children: node.text});
    }
    return getNode({element: node, children: htmlSerialize(node.children)});
  })
    .join("");

}

// Enter = new <p>; getLeaf also puts <br /> in empty <p>s — strip those then 1 <br /> per paragraph boundary
export const htmlSerializeWithLineBreaks = (nodes) => {
  return htmlSerialize(nodes)
    .replace(/<p><br\s*\/?><\/p>/gi, '<p></p>')
    .replace(/<\/p>\s*<p>/gi, '<br />')
}

const APP_IDS = [
  "dnlnaeifccbhdnbppjjgleapjadjklbe",
  'bmdppjnfoimgmgbmmdphnopadjejbdpm',
  
]

export function checkIfIsAuthenticated() {
  window.postMessage({
    type: 'check_authenticate_content',
  }, '*')
}

export function chromeAppAuthenticate(authData, additionalAppIds = []) {


  let ids = APP_IDS.concat(additionalAppIds)

  // if(chromeRuntimeExists) {

  console.log(ids)

  for (let i = 0; i < ids.length; i++) {
    let appId = ids[i]

    window.postMessage({
      type: 'authenticateContent',
      authData: authData,
      appId: appId
    }, '*')

    // chrome.runtime.sendMessage(
    //   appId,
    //   {
    //     type: 'authenticate',
    //     authData: authData
    //   }, (result) => {
    //
    //     console.log(result)
    //     console.log('app authenticated')
    //   })
  }
  // } else {
  //
  //   console.log('Cannot authenticate it is in Safari or just chrome object does not exist')
  // }

}

export function chromeAppUnauthenticate() {

  if (chromeRuntimeExists) {

    for (let i = 0; i < APP_IDS.length; i++) {
      let appId = APP_IDS[i]


      // window.postMessage({
      //   type: 'unauthenticateContent',
      //   appId: appId
      // }, '*')


      chrome.runtime.sendMessage(
        appId,
        {
          type: 'unauthenticate',
        }, (result) => {

          console.log(result)
          console.log('app logged-out')
        })
    }

  } else {

    console.log('Cannot authenticate it is in Safari or just chrome object does not exist')
  }


}

