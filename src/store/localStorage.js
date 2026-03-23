import SecureLS from 'secure-ls'
const ls = new SecureLS({ encodingType: 'aes' });

const loadItem = (key) => {
  try {
    const serializedState = ls.get(key)
    if (serializedState === null) {

      return undefined
    }

    return JSON.parse(serializedState)
  } catch (error) {

    return undefined
  }
};

const saveItem = (key, value) => {
  try {
    const serializedState = JSON.stringify(value)
    ls.set(key, serializedState)
  } catch (error) {
    console.log(error)
  }
}

const removeItem = (key) => {

  try {
    ls.remove(key)
  } catch (error) {
    console.log(error)
  }
}

export default {
  loadItem,
  saveItem,
  removeItem
}

// export default {
//   loadItem,
//   saveItem,
//   removeItem
// };
