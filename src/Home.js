import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useInfiniteQuery } from 'react-query';
import TinderCard from './libs/react-tinder-card';
import { fetchRandom } from './api/profiles';
import Like from './components/like/like';

const REFETCH_THRESHOLD = 2

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
  })
  
  const allGirls = data && ('pages' in data) ? data.pages.flat() : []
  
  const swiped = (direction, id) => {
    const girl = allGirls.find((item) => item.id === id);
    console.log('removing', girl);
    setLastDirection(direction);
    swipedGirls.current = swipedGirls.current.concat(id);
    console.log(`Seen: ${allGirls.length}, swiped: ${swipedGirls.current.length}.`)
    
    if ( shouldFetch() && ( !isFetching || !isFetchingNextPage ) ) {
      console.log(`GET MORE GIRLS! Seen: ${allGirls.length}, swiped: ${swipedGirls.current.length}.`)
      fetchNextPage()
    }
  }

  const shouldFetch = () => (allGirls.length - swipedGirls.current.length) <= REFETCH_THRESHOLD

  const outOfFrame = (id) => {
    const person = allGirls.find((item) => item.id === id);
    console.log('left the screen', person)
  }

  const undo = () => {
    if (swipedGirls.current.length === 0) return;
    const id = swipedGirls.current[swipedGirls.current.length - 1];
    childRefs.current[id].current.restoreCard();
  }

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
          <link href='https://fonts.googleapis.com/css?family=Damion&display=swap' rel='stylesheet' />
          <link href='https://fonts.googleapis.com/css?family=Alatsi&display=swap' rel='stylesheet' />

          <h1>Penyegaran TL</h1>

          <div className='cardContainer'>
            {/* last card ketika sudah semua diswipe */}
            <TinderCard
              className='swipe'
              preventSwipe={['left', 'right', 'up', 'down']}
            >
              <div style={{ backgroundImage: `url(https://via.placeholder.com/500x500.png?text=habis+bray.+ty+ty!)` }} className='card'>
                {/* <p>habis :(</p> */}
              </div>
            </TinderCard>

            {allGirls.map((girl) =>
              <TinderCard
                className='swipe'
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
            <button onClick={() => undo()}>Undo</button>
          </div>

          {lastDirection ? <h2 className='infoText'>You swiped {lastDirection}</h2> : <h2 className='infoText' />}
        </>
      )}
    </div>
  )
}

export default Home
