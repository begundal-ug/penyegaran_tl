import React, { useState, useRef } from 'react';
import { useQuery, useInfiniteQuery } from 'react-query';
import TinderCard from './libs/react-tinder-card';
import { fetchProfile, fetchRandom } from './api/profiles';
import BadgeLike from './components/badge-like/like';
import BadgeOriginalTweet from './components/badge-original-tweet/original-tweet';
import { useParams } from 'react-router-dom';

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

  const { profileId } = useParams();
  
  const { data: profile } = useQuery(
    ['profiles'],
    () => !!profileId ? fetchProfile( profileId ) : false,
    )
  
  const allGirls = data && ('pages' in data)  
                      ?  profile 
                        ? [...data.pages.flat(), profile] 
                        : [...data.pages.flat()]
                      : []
  
  const swiped = (direction, id) => {
    const girl = allGirls.find((item) => item.id === id);
    console.log('swiping ', girl);
    !swipedGirls.current.includes(id) && swipedGirls.current.push(id)
    setLastDirection(direction);
  }
  
  const shouldFetch = () => (allGirls.length - removedGirls.current.length) === REFETCH_THRESHOLD
  
  const outOfFrame = (id) => {
    const person = allGirls.find((item) => item.id === id);
    console.log('left the screen', person)

    swipedGirls.current.splice(swipedGirls.current.indexOf(id), 1)
    removedGirls.current.push(id);
    console.log(`Total: ${allGirls.length}, removed: ${removedGirls.current.length}.`)

    if ( shouldFetch() && ( !isFetching || !isFetchingNextPage ) ) {
      console.log(`GET MORE GIRLS! Total: ${allGirls.length}, removed: ${removedGirls.current.length}.`)
      fetchNextPage()
    }
  }

  const swipe = async (dir) => {
    const currentGirl = getCurrentlyShownGirl()
    !!currentGirl && childRefs.current[currentGirl.unique_key].current.swipe(dir)
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
      text : "seger nih, cekidot di",
      image : currentGirl.link_display,
      via : "penyegaran_tl",
      url : `https://penyegaran.ml/${currentGirl.id}`,
      hashtags: "penyegaran_ml"
    })

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
    childRefs.current[girl.unique_key] = childRefs.current[girl.unique_key] || React.createRef();
  }

  return (
    <div>
      { status === 'loading' ? (
        <p>Loading...</p>
      ) : status === 'error' ? (
        <p>Error: {error.message}</p>
      ) : (
        <>
          <h1>Penyegaran Timeline</h1>

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
                key={girl.unique_key}
                ref={childRefs.current[girl.unique_key]}
                onSwipe={(dir) => swiped(dir, girl.unique_key)}
                onCardLeftScreen={() => outOfFrame(girl.unique_key)}
              >
                <div style={{ backgroundImage: `url(${girl.img})` }} className='card'>
                  <div className='badge-container'>
                    <BadgeLike count={girl.likes} />
                    <BadgeOriginalTweet link={girl.link} accountName="penyegaran_tl" />
                  </div>
                </div>
              </TinderCard>
            )}
          </div>

          <div className="buttons jc-space-between">
            <button className="button dislike" onClick={ () => swipe('left') }>👎</button>
            <button className="button tweet" onClick={ onShareTweet }>Share on Twitter</button>
            <button className="button like" onClick={ () => swipe('right') }>👍</button>
          </div>

          <h2 className='infoText'>
            {lastDirection ? `You swiped ${lastDirection}` : 'Swipe card to get started'}
          </h2>
          <footer>
            <p>
              Copyright &copy; Allah SWT dengan segala keindahan ciptaan-Nya.
              Seluruh kode aplikasi ini tersedia secara secara sumber terbuka dan dapat dilihat, dipelajari, diambil dan digunakan di Github. 
              Seluruh data dan gambar diambil dari timeline <a href="https://twitter.com/penyegaran_tl" target="_blank">@penyegaran_tl</a> di Twitter. 
              Jika Anda ingin foto Anda diambil dari website ini, silakan japri langsung dengan pembuat via Twitter<br/>
            </p>
            <p>
              Sebuah karya kurang kerjaan persembahan dari <a href="https://twitter.com/ans4175" target="_blank">@ans4175</a> dengan <a href="https://twitter.com/anwari888" target="_blank">@anwari888</a>, yang ingin berkarya dan belajar saja. 
              Kami tidak berafiliasi dengan admin dari @penyegaran_tl.
            </p>
          </footer>
        </>
      )}
    </div>
  )
}

export default Home
