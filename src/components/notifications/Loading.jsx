import React from 'react'

export default function Loading (props) {
  return (
    <div class={`${props.addClass} ui active dimmer`}>
      <div class='ui text loader'>{props.message}</div>
    </div>
  )
}
