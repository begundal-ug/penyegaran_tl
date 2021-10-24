import React, { useState, useRef } from 'react';
import { useInfiniteQuery } from 'react-query';
import TinderCard from './libs/react-tinder-card';
import { fetchRandom } from './api/profiles';
import Like from './components/like/like';

const REFETCH_THRESHOLD = 3

function Home () {
  const [lastDirection, setLastDirection] = useState('')
  const swipedGirls = useRef([])
  const childRefs = useRef({});
  
  const {
    status,
    data,
    isFetching,
    isFetchingNextPage,
    fetchNextPage
  } = useInfiniteQuery('randomgirls', fetchRandom, {
      getNextPageParam: (lastPage, pages) => true, // lastPage.nextCursor,
      select : data => ({
        pages: [...data.pages].reverse(),
        pageParams: [...data.pageParams].reverse()
      }),
  })
  
  const allGirls = data && ('pages' in data) ? data.pages.flat() : []
  
  const swiped = (direction, id) => {
    const girl = allGirls.find((item) => item.id === id);
    console.log('removing', girl);
    setLastDirection(direction);
    swipedGirls.current.push(id);
    console.log(`Seen: ${allGirls.length}, swiped: ${swipedGirls.current.length}.`)
    
    if ( shouldFetch() && ( !isFetching || !isFetchingNextPage ) ) {
      console.log(`GET MORE GIRLS! Seen: ${allGirls.length}, swiped: ${swipedGirls.current.length}.`)
      fetchNextPage()
    }
  }

  const shouldFetch = () => (allGirls.length - swipedGirls.current.length) === REFETCH_THRESHOLD

  const outOfFrame = (id) => {
    const person = allGirls.find((item) => item.id === id);
    console.log('left the screen', person)
  }

  const swipe = () => {}

  for (const girl of (allGirls || [])) {
    childRefs.current[girl.id] = childRefs.current[girl.id] || React.createRef();
  }

  return (
    <div>
      { status === 'loading' ? (
        <p>Loading...</p>
      ) : status === 'error' ? (
        <p>Error: {error.message}</p>
      ) : (
        <>
          <h1>@Penyegaran_TL</h1>

          <div className='cardContainer'>
            {/* last card ketika sudah semua diswipe */}
            <TinderCard
              className='swipe'
              preventSwipe={['left', 'right', 'up', 'down']}
            >
              <div style={{ backgroundImage: `url(https://via.placeholder.com/500x500.png?text=habis+bray.+ty+ty!)` }} className='card' />
            </TinderCard>

            {allGirls.map((girl) =>
              <TinderCard
                className='swipe'
                preventSwipe={['down']}
                key={girl.id}
                ref={childRefs.current[girl.id]}
                onSwipe={(dir) => swiped(dir, girl.id)}
                onCardLeftScreen={() => outOfFrame(girl.id)}
              >
                <div style={{ backgroundImage: `url(${girl.img})` }} className='card'>
                  <Like count={girl.likes} />
                </div>
              </TinderCard>
            )}
          </div>

          <div className='buttons'>
            <button className="dislike" onClick={() => swipe('left') }>MEH 👎</button>
            <button className="like" onClick={() => swipe('right') }>YEAH 👍</button>
          </div>
          <h2 className='infoText'>
            {lastDirection ? `You swiped ${lastDirection}` : 'Swipe card to get started'}
          </h2>
        </>
      )}
    </div>
  )
}

export default Home
