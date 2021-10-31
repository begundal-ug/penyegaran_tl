import React, { useState, useRef } from 'react';
import { useInfiniteQuery } from 'react-query';
import TinderCard from './libs/react-tinder-card';
import { fetchRandom } from './api/profiles';
import Like from './components/like/like';
import { sendEvent } from './libs/ga-analytics';

const REFETCH_THRESHOLD = 3

function Home () {
  const [lastDirection, setLastDirection] = useState('')
  const swipedGirls = useRef([])  // apparently swiped != removed, so we need 2 arrays to maintain :/
  const removedGirls = useRef([])
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
  
  const allGirls = data && ('pages' in data) ? data.pages.flat() : [];

  const valueDir = (dir) => {
    return (dir == 'left') ? 0 : (dir == 'right') ? 1 : (dir == 'up') ? 2 : 99;
  }
  
  const swiped = (direction, id) => {
    const girl = allGirls.find((item) => item.id === id);
    console.log('swiping ', girl);
    !swipedGirls.current.includes(id) && swipedGirls.current.push(id)
    setLastDirection(direction);
    sendEvent({
      category: 'interaction',
      action: 'swiping',
      label: girl.link_display,
      value: valueDir(direction),
    });
  }
  
  const shouldFetch = () => (allGirls.length - removedGirls.current.length) === REFETCH_THRESHOLD
  
  const outOfFrame = (id) => {
    const person = allGirls.find((item) => item.id === id);
    console.log('left the screen', person)

    swipedGirls.current.splice(swipedGirls.current.indexOf(id), 1)
    removedGirls.current.push(id);
    console.log(`Total: ${allGirls.length}, removed: ${removedGirls.current.length}.`)

    if ( shouldFetch() && ( !isFetching || !isFetchingNextPage ) ) {
      console.log(`GET MORE GIRLS! Total: ${allGirls.length}, removed: ${removedGirls.current.length}.`);
      sendEvent({
        category: 'interaction',
        action: 'refetch'
      });
      fetchNextPage();
    }
  }

  const swipe = async (dir) => {
    const currentGirl = getCurrentlyShownGirl();
    !!currentGirl && childRefs.current[currentGirl.id].current.swipe(dir);
    sendEvent({
      category: 'interaction',
      action: 'swiping_button',
      label: currentGirl.link_display,
      value: valueDir(dir),
    });
  }

  const getCurrentlyShownGirl = () => {
    const swiped = swipedGirls.current.length + removedGirls.current.length
    const total = allGirls.length
    return allGirls[total-1-swiped]
  }

  const onShareTweet = () => {
    const currentGirl = getCurrentlyShownGirl()
    console.log("Hit twitter URL: ", currentGirl.link_display )
    
    const url = buildTweetIntentUrl({
      text : "seger nih, cekidot banyak banget di",
      image : currentGirl.link_display,
      via : "penyegaran_tl",
      url : "https://penyegaran.ml",
      hashtags: "penyegaran_ml"
    })
    sendEvent({
      category: 'interaction',
      action: 'sharing',
      label: currentGirl.link_display
    });

    window.open(url, '_blank')
  }

  const buildTweetIntentUrl = ({text, url, image, via, hashtags}) => (
    "https://twitter.com/intent/tweet" 
    +"?text="+ encodeURI(image) + "%20" + encodeURI(text)
    +"&original_referer=" + encodeURI(url) 
    +"&url=" + encodeURI(url) 
    +"&via=" + encodeURI(via) 
    +"&hashtags=" + encodeURI(hashtags)  
  )

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
            <button className="dislike" onClick={ () => swipe('left') }>MEH 👎</button>
            <button className="like" onClick={ () => swipe('right') }>YEAH 👍</button>
          </div>

          <div className='buttons'>
            <button className="tweet" onClick={ onShareTweet }>Share on Twitter</button>
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
