import React, { Component } from 'react';
//import logo from './logo.svg';
import './App.css';
import { Rnd } from "react-rnd";
import 'bootstrap/dist/css/bootstrap.css';
import ImageViewer from './view-image/index.js'
import './view-image/style.css'

// const style = {
//   display: "flex",
//   //alignItems: "center",
//   //justifyContent: "center",
//   border: "solid 1px #ddd",
//   background: "#f0f0f0"
// };

class App extends Component {
  render() {
    const images = [
      { src: '/images/4275fd79-0b32-4aef-8c88-15ad3e91d7d0.JPG', title: 'title', content: 'content' },
      { src: '/images/4848fba3-098f-41fb-93e7-e50ea6dd7225.JPG', title: 'title', content: 'content' },
      { src: '/images/5636a44d-b1e1-4fb9-88f4-402bdde5fa4c.JPG', title: 'title', content: 'content' },
      { src: '/images/fc8c5cf3-0745-411a-83cd-4a5ec2df2d60.JPG', title: 'title', content: 'content' }
    ];

    return (
      <div>

      <ImageViewer
        showPreview={true}
        showIndex={true}
        prefixCls="mycomponent"
        activeIndex={0}
        images={images} />

        {/* <Rnd
          style={style}
          default={{
            x: 0,
            y: 0,
            width: 320,
            height: 200
          }}
        >
          <div className='rnd' >
            <div className='row'>
              <div className='object'>Object</div>
              <div className='title'>Title</div>
            </div>

            <div className='details'>
              -Tiêu đề: Nội dung <br />
              -Tiêu đề: Nội dung<br />
              -Tiêu đề: Nội dung<br />
              -Tiêu đề: Nội dung<br />
            </div>
          </div>
        </Rnd> */}
        </div>
    )

    // return (
    //   <div className="App">
    //     <Rnd
    //       style={style}
    //       default={{
    //         x: 0,
    //         y: 0,
    //         width: 320,
    //         height: 200
    //       }}
    //     >
    //       <div className='rnd' >
    //         <div className='row'>
    //           <div className='object'>Object</div>
    //           <div className='title'>Title</div>
    //         </div>

    //         <div className='details'>
    //           -Tiêu đề: Nội dung <br />
    //           -Tiêu đề: Nội dung<br />
    //           -Tiêu đề: Nội dung<br />
    //           -Tiêu đề: Nội dung<br />
    //         </div>
    //       </div>
    //     </Rnd>
    //   </div>
    // );
  }
}

export default App;
