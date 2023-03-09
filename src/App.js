import './App.css';
import Header from './Header.js';
import Hero from './Hero.js';
import React from 'react';
import Content from './Content.js';
import Footer from './Footer';



function App() {

  return (
    <div>
      <Header />
      <div className='hero' id='hero'>
        <div className='app'>
          <Hero />
        </div>
      </div>
      <div className='app'>
        <Content />
      </div>
      <Footer />
    </div>
  );

}



export default App;


