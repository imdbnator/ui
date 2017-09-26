import React from 'react'

export default function Dimmer (props) {
  return (
    <div class='ui active dimmer'>
      <div class='content'>
        <div class='center'>
          <h2 class='ui inverted icon header'>
            <i class={props.icon} />
            {props.header}
            <div class='sub header' dangerouslySetInnerHTML={{__html: props.message}}></div>
          </h2>
        </div>
      </div>
    </div>
  )
}
