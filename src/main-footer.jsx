import dayjs from 'dayjs';
import React from 'react';

function MainFooter (){
    return (
        <footer class="bg-dark py-3 mt-auto">
      <div class="container">
        <div className='col'>
          &copy; {dayjs().format('YYYY')}
        </div>
        <div className='col'>
          Develop by bpsingh
        </div>
      </div>
    </footer>
    )
};//end

export default MainFooter;