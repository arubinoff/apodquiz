(() => { 
  let score;
  let completed = 0;
  let numQs;

  function decode(str) {
    const input = 'nopqrstuvwxyz0123456789abcdefghijklm';
    const output = 'abcdefghijklmnopqrstuvwxyz0123456789';
    var translate = x => input.indexOf(x) > -1 ? output[input.indexOf(x)] : x;
    return str.split('').map(translate).join('');
  }
  
  function getMiniDateStr(date) {
    let m = date.getMonth() + 1;
    m = m.length < 2 ? `0${m}` : m;
    let d = date.getDate();
    d = d.length < 2 ? `0${d}` : d; 
    return `${m}-${d}-${date.getFullYear()}`;
  }

  const cookiename = 'lastcompleted';

  function completeQuiz() {
    document.querySelector('.finished').classList.remove('invisible');
    const date = new Date();

    // value is today's date as a string
    const completed = getMiniDateStr(date);
    
    date.setTime(date.getTime() + (2*24*60*60*1000)); // Expire in 2 days from now
    const expires = date.toUTCString();
    
    document.cookie = `${cookiename}=${completed};expires=${expires};path=/`;
  }

  function hasQuizAlreadyBeenCompleted() {
    const cookies = document.cookie.split('; ');
    for (let i = 0; i < cookies.length; i++) {
      const parts = cookies[i].split('=');
      if (parts[0] !== cookiename) {  
        continue;
      }
      const lastDate = parts[1];
      const today = new Date();
      return lastDate === getMiniDateStr(today);
    }
    // If we got here there's no lastcompleted cookie
    return false;
  }

  function completeQuestion(input) {
    input.classList.add('completed');
    input.setAttribute('disabled','true');
    completed++;
    score.querySelector('span.num').innerHTML = completed;
    if (completed >= numQs) {
      completeQuiz();
    }
  }

  function verifyAnswer(e) {
    const input = e.target;
    const answer = input.parentElement.querySelector('.answer');
    if (input.value.toLowerCase() === decode(answer.innerText.toLowerCase())) {
      completeQuestion(input);
    }
  }

  function openAllLinks() {
    document.querySelectorAll('a.link.hidden').forEach((link) => {
      window.open(link.getAttribute('href'));
    })
  }

  function switchMobileQuestion(el) {
    const direction = el.innerText === '<' ? -1 : 1;
    const questions = document.querySelectorAll('.question');
    let i = 0;
    for (; i < questions.length; i++) {
      if (!questions[i].classList.contains('hidden')) {
        break;
      }
    }
    questions[i].classList.add('hidden');
    i = (i + direction) % questions.length;
    if (i < 0) { i += questions.length; }
    questions[i].classList.remove('hidden');
  }

  function hideText() {
    [
      document.querySelector('.header'),
      document.querySelector('.explanation'),
      document.querySelector('.quiz'),
    ].forEach((el) => {
      el.classList.add('invisible');
    });
  }

  function showText() {
    [
      document.querySelector('.header'),
      document.querySelector('.explanation'),
      document.querySelector('.quiz'),
    ].forEach((el) => {
      el.classList.remove('invisible');
    });
  }

  function toggleTextVisibility(el) {
    const command = el.innerText.split(' ')[0];
    if (command === 'Hide') {
      el.innerText = 'Show Text';
      hideText();
    } else {
      el.innerText = 'Hide Text';
      showText();
    }
  }

  window.onload = () => {
    const quizAlreadyCompleted = hasQuizAlreadyBeenCompleted();

    const questions = document.querySelectorAll('input.blank');
    numQs = questions.length;
    
    score = document.querySelector('.score');
    score.querySelector('.whole').innerText = numQs;
    
    questions.forEach((input) => {
      const answerDiv = input.parentElement.querySelector('.answer');
      const answer = answerDiv.innerText.toLowerCase().trim();
      answerDiv.innerHTML = answer;
      
      const width = Math.max(40, answer.length*10);
      input.setAttribute('style', `width:${width}px;`);

      if (quizAlreadyCompleted) {
        input.value = decode(answer);
        completeQuestion(input);
      } else {
        // No point in setting a listener if the input is already completed
        input.onkeyup = (e) => { verifyAnswer(e); };
      }
    });

    document.querySelector('.openlinks').onclick = () => {
      openAllLinks();
    };

    // set up mobile behavior if mobile is visible
    if (document.querySelector('.mobile').computedStyleMap().get('display').value === 'block') {
      document.querySelectorAll('button.mobile').forEach((el) => {
        el.onclick = () => {
          switchMobileQuestion(el);
        }
      });

      let first = true;
      document.querySelectorAll('.question').forEach((el) => {
        if (first) {
          first = false;
        } else {
          el.classList.add('hidden');
        }
      });

      document.querySelector('.hide').onclick = (event) => {
        toggleTextVisibility(event.target);
      };

      // set up text fade-in
      window.setTimeout(() => {
        [
          document.querySelector('.header'),
          document.querySelector('.explanation'),
          document.querySelector('.quiz'),
        ].forEach((el) => {
          el.classList.remove('hidden');
        });
      }, 1500);
      window.setTimeout(() => {
        showText();
        // Show the button to control the text as well (but this will never hide again)
        document.querySelector('.hideContainer').classList.remove('invisible');
      }, 2000);
    } else {
      // If this is desktop, show the hidden text for good
      showText();
    }
  };

})();