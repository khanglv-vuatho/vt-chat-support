import { useState } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'

const TestPage = () => {
  const [items, setItems] = useState(Array.from({ length: 20 }))
  const [hasMore, setHasMore] = useState(true)

  const style = {
    height: 30,
    border: '1px solid green',
    margin: 6,
    padding: 8
  }

  const fetchMoreData = () => {
    if (items.length >= 100) {
      setHasMore(false) // Stop fetching when we reach 100 items
      return
    }

    // Simulate async data fetching
    setTimeout(() => {
      setItems((prevItems) => prevItems.concat(Array.from({ length: 20 })))
    }, 1500)
  }

  return (
    <div
      id='scrollableDiv'
      style={{
        height: 300,
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column-reverse'
      }}
    >
      {/* Put the scroll bar always on the bottom */}
      <InfiniteScroll
        dataLength={items.length}
        next={fetchMoreData}
        style={{ display: 'flex', flexDirection: 'column-reverse', gap: 10 }} // To put endMessage and loader to the top.
        inverse={true}
        hasMore={hasMore}
        loader={<h4>Loading...</h4>}
        scrollableTarget='scrollableDiv'
        endMessage={
          <p style={{ textAlign: 'center' }}>
            <b>You have seen it all!</b>
          </p>
        }
      >
        {items.map((_, index) => (
          <div style={style} key={index}>
            div - #{index}
          </div>
        ))}
      </InfiniteScroll>
    </div>
  )
}

export default TestPage
