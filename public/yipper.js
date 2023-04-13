/**
 * Name: Shin Komori
 * Date: November 18, 2022
 * Section: CSE 154 AB
 *
 * This is client-side javascript file, yipper.js for YIPPER web application.
 * It makes it possible for users to browse yips posted on timeline, to search
 * for specific word that appears in yips posted, and to post a new yip.
 * It has implemented like functionality too, where users can like a specific
 * post of yip.
 */

'use strict';

(function () {
  window.addEventListener('load', init);

  /**
   * This is the function which is executed when load event is fired.
   */
  function init() {
    getYips();
    id('search-term').addEventListener('input', searchBarHandler);
    id('search-btn').addEventListener('click', searchBtnClickHandler);
    id('home-btn').addEventListener('click', homeBtnClickHandler);
    id('yip-btn').addEventListener('click', yipBtnClickHandler);
    qs('form').addEventListener('submit', function (evt) {
      evt.preventDefault();
      submitBtnClickHandler();
    });
  }

  /**
   * Takes all the yips posted from server-side, and displays each of these yips
   * to home view.
   */
  function getYips() {
    let url = '/yipper/yips';
    fetch(url)
      .then(statusCheck)
      .then((resp) => resp.json())
      .then(populateYips)
      .catch(handleError);
  }

  /**
   * Given the object that has information of yips, it creates container for each
   * yip and then populates them to home view.
   * @param {object} resp object that is returned from server.
   */
  function populateYips(resp) {
    for (let i = 0; i < resp.yips.length; i++) {
      let container = createContainer(resp.yips[i]);
      id('home').appendChild(container);
    }
  }

  /**
   * Creates overall container for a yip. It generates and returns container as
   * HTML element. Each container has an image of a dog, name, content, time it
   * was posted, and the number of likes it got.
   * @param {object} obj Object that has information of one yip.
   * @returns {HTMLElement} container HTMLElement that works as container of yip.
   */
  function createContainer(obj) {
    let container = gen('article');
    container.classList.add('card');
    container.id = obj.id;

    let img = gen('img');
    img.src = 'img/' + obj.name.toLowerCase().replaceAll(' ', '-') + '.png';
    img.alt = 'Image of user(user:' + obj.name + ')';

    let firstDiv = createContainerFirstDiv(obj);
    let secondDiv = createContainerSecondDiv(obj);
    container.appendChild(img);
    container.appendChild(firstDiv);
    container.appendChild(secondDiv);

    return container;
  }

  /**
   * Creates and returns the first div element that a yip container need to have.
   * It sets the name of the yipper, content of the yip, and hashtag of it.
   * @param {object} obj Object that has information of one yip.
   * @returns {HTMLElement} firstDiv Div element that will be appended to container
   */
  function createContainerFirstDiv(obj) {
    let firstDiv = gen('div');
    let firstPara = gen('p');
    let secondPara = gen('p');

    firstPara.classList.add('individual');
    firstPara.addEventListener('click', userNameClickHandler);
    firstPara.textContent = obj.name;
    firstDiv.appendChild(firstPara);
    secondPara.textContent = obj.yip + ' #' + obj.hashtag;
    firstDiv.appendChild(secondPara);

    return firstDiv;
  }

  /**
   * Creates and returns the second div element that a yip container need to have.
   * It sets the date/time it was posted, image of a dog corresponding to yipper,
   * and like functionality.
   * @param {object} obj Object that has information of one yip.
   * @returns {HTMLElement} secondDiv Div element that will be appended to container
   */
  function createContainerSecondDiv(obj) {
    let secondDiv = gen('div');
    let dateP = gen('p');
    let divLikes = gen('div');
    let likeImg = gen('img');
    let likeCount = gen('p');

    secondDiv.classList.add('meta');
    dateP.textContent = new Date(obj.date).toLocaleString();
    likeImg.src = 'img/heart.png';
    likeImg.alt = 'Image of a heart';
    likeImg.addEventListener('click', heartClickHandler);
    likeCount.textContent = obj.likes;
    divLikes.appendChild(likeImg);
    divLikes.appendChild(likeCount);
    secondDiv.appendChild(dateP);
    secondDiv.appendChild(divLikes);

    return secondDiv;
  }

  /**
   * ClickHandler of username on each yip post. Fires when username is clicked.
   * It changes the view to that of user. It lists all the yips created by the
   * user whose name was clicked on. It only shows incrementing number of the
   * posts and its content/hashtag.
   */
  function userNameClickHandler() {
    id('search-term').value = '';
    hide(id('home'));
    hide(id('new'));

    let user = id('user');
    user.innerHTML = '';
    show(user);

    let url = '/yipper/user/' + this.textContent;
    fetch(url)
      .then(statusCheck)
      .then((resp) => resp.json())
      .then(showUsersYips)
      .catch(handleError);
  }

  /**
   * ClickHandler of heart images that are located on each yip post.
   * Fires when the heart image is clicked. It increments the like count of the
   * yip whose heart image is clicked.
   */
  function heartClickHandler() {
    id('search-term').value = '';
    let targetId = this.parentNode.parentNode.parentNode.id;

    let url = '/yipper/likes/';
    let data = new FormData();
    data.append('id', targetId);

    fetch(url, { method: 'POST', body: data })
      .then(statusCheck)
      .then((resp) => resp.text())
      .then((resp) => {
        this.nextElementSibling.textContent = resp;
      })
      .catch(handleError);
  }

  /**
   * Given an object that contains information of yips of a specific user, it
   * displays those yips in user view.
   * @param {object} resp an object that has information of yips of a specific user.
   */
  function showUsersYips(resp) {
    let container = gen('article');
    container.classList.add('single');

    let h2 = gen('h2');
    h2.textContent = 'Yips shared by ' + resp[0].name + ':';
    container.appendChild(h2);

    for (let i = 0; i < resp.length; i++) {
      let yipInfo = gen('p');
      let post = resp[i];
      yipInfo.textContent =
        'Yip ' + (i + 1) + ': ' + post.yip + ' #' + post.hashtag;
      container.appendChild(yipInfo);
    }

    id('user').appendChild(container);
  }

  /**
   * Handler function of the search bar located in the top of the website.
   * When text is typed in, it trimms whitespace on both sides and treat it as
   * input. When input is '', then it does not enable search button.
   */
  function searchBarHandler() {
    let inputTxt = id('search-term').value.trim();
    let searchBtn = id('search-btn');

    if (inputTxt && id('error').classList.contains('hidden')) {
      searchBtn.disabled = false;
    } else {
      searchBtn.disabled = true;
    }
  }

  /**
   * ClickHandler of search button. When clicked, it searches the yip post that
   * contains word that is equal to input of search bar.
   */
  function searchBtnClickHandler() {
    show(id('home'));
    hide(id('user'));
    hide(id('new'));

    let url = '/yipper/yips?search=' + id('search-term').value.trim();
    fetch(url)
      .then(statusCheck)
      .then((resp) => resp.json())
      .then(showSearchResult)
      .catch(handleError);
  }

  /**
   * This shows the result of a search of yips that has a specific word. Given
   * an object that has information of yips whose content contains the word, it
   * hides all other yips and shows only posts with the word.
   * @param {object} resp 後で
   */
  function showSearchResult(resp) {
    id('search-btn').disabled = true;
    let idList = [];
    for (let i = 0; i < resp.yips.length; i++) {
      idList.push(String(resp.yips[i].id));
    }

    let containers = qsa('article .card');
    for (let i = 0; i < containers.length; i++) {
      if (!idList.includes(containers[i].id)) {
        hide(containers[i]);
      } else {
        show(containers[i]);
      }
    }
  }

  /**
   * ClickHandler of home button. It hides unnecessary views, and resets input value
   * of search bar. Then, it shows the all yips that has been posted.
   */
  function homeBtnClickHandler() {
    id('search-term').value = '';
    hide(id('user'));
    hide(id('new'));
    show(id('home'));

    let containers = qsa('article .card');
    for (let i = 0; i < containers.length; i++) {
      show(containers[i]);
    }
  }

  /**
   * ClickHandler of yip button. When clicked, it hides unnecessary views, and
   * shows the view for the user to post a new yip.
   */
  function yipBtnClickHandler() {
    id('search-term').value = '';
    hide(id('user'));
    hide(id('home'));
    show(id('new'));
    let containers = qsa('article .card');
    for (let i = 0; i < containers.length; i++) {
      show(containers[i]);
    }
  }

  /**
   * ClickHandler of submit button. Used to post a new yip.
   * When the submit button is clicked, the form contents will be cleared.
   * After two seconds, the view goes back to home view.
   */
  function submitBtnClickHandler() {
    let name = id('name');
    let yip = id('yip');

    let url = '/yipper/new';
    let data = new FormData();
    data.append('name', name.value);
    data.append('full', yip.value);

    fetch(url, { method: 'POST', body: data })
      .then(statusCheck)
      .then((resp) => resp.json())
      .then(addNewYipCard)
      .catch(handleError);

    name.value = '';
    yip.value = '';
  }

  /**
   * Adds a new yip to home view(timeline). The new yip comes at the top of the
   * timeline, rather than being appended at the end. It also changes the view
   * two seconds after posting a new yip.
   * @param {obj} resp object that has the information of new yip.
   */
  function addNewYipCard(resp) {
    let newYipCard = createContainer(resp);
    id('home').prepend(newYipCard);

    setTimeout(() => {
      show(id('home'));
      hide(id('new'));
    }, 2000);
  }

  /**
   * Checks the status code is in the range of ok, and see if a returned object
   * from fetch has appropriate data.
   * @param {object} res object that is returned from fetch.
   * @returns {object} res if ok, throws error if not
   */
  async function statusCheck(res) {
    if (!res.ok) {
      throw new Error(await res.text());
    }
    return res;
  }

  /**
   * Handles error in case of promises not resolveing in .then, .catch chain.
   * It hides normal view including yips and then displays error message.
   */
  function handleError() {
    hide(id('yipper-data'));
    show(id('error'));
    let btns = qsa('nav button');
    for (let i = 0; i < btns.length; i++) {
      btns[i].disabled = true;
    }
  }

  /**
   * Utility function. Generates an <tagName> element.
   * @param {string} tagName HTML element to be created.
   * @returns {HTMLElement} newly created DOM object of <tagName>.
   */
  function gen(tagName) {
    return document.createElement(tagName);
  }

  /**
   * Utility function. Gets an element using id.
   * @param {string} id takes id as str.
   * @returns {HTMLElement} DOM object associated with id.
   */
  function id(id) {
    return document.getElementById(id);
  }

  /**
   * Utility function. Gets an element using selector.
   * @param {string} selector CSS selecgtor of desired object.
   * @returns {HTMLElement} DOM object associated with selector.
   */
  function qs(selector) {
    return document.querySelector(selector);
  }

  /**
   * Utility function. Gets all element that matches the selector.
   * @param {string} selector query selector for desired elements
   * @returns {HTMLElement} DOM object associated with selector.
   */
  function qsa(selector) {
    return document.querySelectorAll(selector);
  }

  /**
   * Utility function. Adds hidden class from element of given selector.
   * @param {HTMLElement} element element that is desired
   */
  function hide(element) {
    element.classList.add('hidden');
  }

  /**
   * Utility function. Removes hidden class from element of given selector.
   * @param {HTMLElement} element element that is desired
   */
  function show(element) {
    element.classList.remove('hidden');
  }
})();
