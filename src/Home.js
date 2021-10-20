import React, { useState, useRef } from 'react';
import { useQuery } from 'react-query';
import TinderCard from './libs/react-tinder-card';
import { fetchRandom } from './api/profiles';

function Home () {
  const [lastDirection, setLastDirection] = useState()
  const [alreadyRemoved, setAlreadyRemoved] = useState([])
  const childRefs = useRef({});

  const { data: characters, error, isLoading, isError, isFetching } = useQuery(
    ['profiles'],
    () => fetchRandom(),
  )

  const refSwiped = useRef();
  refSwiped.current = (direction, id) => {
    const person = characters.find((item) => item.id === id);
    console.log('removing', person)
    setLastDirection(direction)
    setAlreadyRemoved(alreadyRemoved.concat(id))
  }

  const swiped = (...args) => {
    refSwiped.current(...args);
  }

  const refOutOfFrame = useRef();
  refOutOfFrame.current = (lastDir, id) => {
    const person = characters.find((item) => item.id === id);
    console.log('left the screen', person)
  }

  const outOfFrame = (...args) => {
    refOutOfFrame.current(...args);
  }

  const undo = () => {
    if (alreadyRemoved.length === 0) return;
    const id = alreadyRemoved[alreadyRemoved.length - 1];
    childRefs.current[id].current.restoreCard();
  }

  const debug = () => {
    console.log('alreadyRemoved', alreadyRemoved.length, alreadyRemoved[alreadyRemoved.length-1]);
    console.log('lastDirection', lastDirection);
  }

  for (const character of (characters || [])) {
    childRefs.current[character.id] = childRefs.current[character.id] || React.createRef();
  }

  return (
    <div>
      {isLoading || isFetching ? (
        <p>Loading...</p>
      ) : isError ? (
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
              <div style={{ backgroundImage: `url(https://via.placeholder.com/500x500.png?text=habis+bray.+ty+ty!)` }} className='card'>
                <h3>habis :(</h3>
              </div>
            </TinderCard>

            {characters.map((character) =>
              <TinderCard
                className='swipe'
                preventSwipe={['down']}
                key={character.id}
                ref={childRefs.current[character.id]}
                onSwipe={(dir) => swiped(dir, character.id)}
                onCardLeftScreen={(dir) => outOfFrame(dir, character.id)}
              >
                <div style={{ backgroundImage: `url(${character.img})` }} className='card'>
                  <h3>{`like+rt: ${character.likes}`}</h3>
                </div>
              </TinderCard>
            )}
          </div>

          <div className='buttons'>
            {/*<button onClick={() => debug()}>Debug</button>*/}
            <button onClick={() => undo()}>Undo</button>
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
