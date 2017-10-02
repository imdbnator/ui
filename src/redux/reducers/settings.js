const initial = {
  media: {
    type: null,
    width: 0
  }
}

export default function reducer(store = initial, action){
  switch (action.type) {
    case 'GET_MEDIA':
      store = {...store}
      let deviceType = "computer"
      const deviceWidth = action.payload.width
      if (deviceWidth < 768) deviceType = "mobile"
      if (deviceWidth >= 768  && deviceWidth < 991) deviceType = "tablet"
      if (deviceWidth >= 992) deviceType = "computer"
      store.media.width = deviceWidth
      store.media.type = deviceType
      break;
    default:

  }
  return store
}
