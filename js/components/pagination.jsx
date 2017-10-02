import React from 'react'

let componentKey = 0

function Item (props) {
  return (
    <a class={(props.active) ? 'active item' : 'item'} onClick={props.onClick} data-page={props.page} >{props.text}</a>
  )
}

export default function Pagination (props) {
  let Items = []
  const activePage = props.activePage
  const itemsPerPage = props.itemsPerPage
  const totalItems = props.totalItems
  const maxPagesToShow = 6

  // Caculate final page
  let finalPage = 1
  while (totalItems - ((finalPage + 1) * itemsPerPage) > -itemsPerPage) {
    finalPage += 1
  }

  if (finalPage === 1) {
    return (
    <div class={props.addClass}>
      {props.children}
    </div>)
  }

  // Double left and Single left page arrows
  let prevPage = (activePage === 1) ? 1 : (activePage - 1)
  Items.push(
    <Item onClick={props.dispatch} page='1' text={<i class='double left angle icon' data-page='1' />} key={componentKey++} />,
    <Item onClick={props.dispatch} page={prevPage} text={<i class='left angle icon' data-page={prevPage} />} key={componentKey++} />
  )

  // Generate middle pages
  if (finalPage <= maxPagesToShow) {
    let generatePage = 1
    while (generatePage <= finalPage) {
      Items.push(
        <Item active={generatePage === activePage} onClick={props.dispatch} page={generatePage} text={generatePage} key={componentKey++} />
      )
      generatePage++
    }
  } else {
    if (activePage <= maxPagesToShow - 2) {
      let generatePage = 1
      while (generatePage <= maxPagesToShow) {
        Items.push(
          <Item active={generatePage === activePage} onClick={props.dispatch} page={generatePage} text={generatePage} key={componentKey++} />
        )
        generatePage++
      }
      Items.push(
        <Item text='...' key={componentKey++} />,
        <Item onClick={props.dispatch} page={finalPage} text={finalPage} key={componentKey++} />
      )
    } else if (activePage >= (finalPage - (maxPagesToShow - 2))) {
      Items.push(
        <Item onClick={props.dispatch} page='1' text='1' key={componentKey++} />,
        <Item text='...' key={componentKey++} />
      )
      let generatePage = finalPage - maxPagesToShow
      while (generatePage <= finalPage) {
        Items.push(
          <Item active={generatePage === activePage} onClick={props.dispatch} page={generatePage} text={generatePage} key={componentKey++} />
        )
        generatePage++
      }
    } else {
      Items.push(
        <Item onClick={props.dispatch} page='1' text='1' key={componentKey++} />,
        <Item text='...' key={componentKey++} />
      )
      let generatePage = activePage - 1
      while (generatePage <= activePage + 1) {
        Items.push(
          <Item active={generatePage === activePage} onClick={props.dispatch} page={generatePage} text={generatePage} key={componentKey++} />
        )
        generatePage++
      }
      Items.push(
        <Item text='...' key={componentKey++} />,
        <Item onClick={props.dispatch} page={finalPage} text={finalPage} key={componentKey++} />
      )
    }
  }

  // Double right and single right page arrows
  let nextPage = (activePage === finalPage) ? finalPage : (activePage + 1)
  Items.push(
    <Item onClick={props.dispatch} page={nextPage} text={<i class='right angle icon' data-page={nextPage} />} key={componentKey++} />,
    <Item onClick={props.dispatch} page={finalPage} text={<i class='double right angle icon' data-page={finalPage} />} key={componentKey++} />
  )

  return (
    <div class={props.addClass}>
      {props.children}
      { Items }
    </div>
  )
}
