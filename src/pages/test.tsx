import { useState } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'

export default function TestPage() {
  const [data, setData] = useState([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
  const [loading, setLoading] = useState(false)
  const MAX_DATA = 100
  const FETCH_LIMIT = 20 // Set limit to 20

  // Function to fetch more data
  function fetchData(limit = FETCH_LIMIT) {
    if (loading) return // prevent multiple fetches
    setLoading(true) // set loading to true

    const start = data.length + 1
    const end = data.length + limit >= MAX_DATA ? MAX_DATA : data.length + limit
    let newData = [...data]

    for (var i = start; i <= end; i++) {
      newData.push(i) // push directly to array
    }

    // Fake delay to simulate a network request
    setTimeout(() => {
      setData(newData)
      setLoading(false) // reset loading state
    }, 1500)
  }

  // Dynamically calculate hasMore based on current data length
  const hasMore = data.length < MAX_DATA

  return (
    <div
      id='scrollableDiv'
      style={{
        width: '500px',
        height: '100vh',
        overflowY: 'scroll',
        display: 'flex',
        flexDirection: 'column-reverse',
        margin: 'auto'
      }}
      className='bg-body-tertiary p-3'
    >
      <InfiniteScroll
        dataLength={data.length}
        next={() => fetchData(FETCH_LIMIT)} // pass the limit as 20
        hasMore={hasMore}
        loader={<p className='m-5 text-center'>⏳&nbsp;Loading...</p>}
        endMessage={<p className='m-5 text-center'>That&apos;s all folks!🐰🥕</p>}
        style={{ display: 'flex', flexDirection: 'column-reverse', overflow: 'visible' }}
        scrollableTarget='scrollableDiv'
        inverse={true}
      >
        {data.map((d) => (
          <div className='card mb-4' key={d} style={{ width: '18rem' }}>
            <div className='card-header'>Card#{d}</div>
            <div className='card-body'>Lorem ipsum dolor sit amet</div>
          </div>
        ))}
      </InfiniteScroll>
    </div>
  )
}
