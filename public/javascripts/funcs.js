"use strict";

const APIKEY = 'UsppJXiLnEkRVSJzaCP92eXcCZsZAnYAyM8AomWZ',
    MANIFESTS = 'https://api.nasa.gov/mars-photos/api/v1/manifests/',
    ROVER = 'https://api.nasa.gov/mars-photos/api/v1/rovers/';
const SAVE_URL = '/api/save', EXTRACT_URL = '/api/extract', CLEAR_URL = '/api/clear',
    DELETE_URL = '/api/delete/', EMPTY_BODY = JSON.stringify({});
const REQUIRED_AFTER = 'The mission you have selected required a date after ',
    REQUIRED_BEFORE = 'The mission you have selected required a date before max date: ',
    REQUIRED_BEFORE_SOL = 'The mission you have selected required a date before max sol: ',
    INVALID_FORMAT = 'Please enter a valid format of date', NOT_EXIST_DATE = 'This date does not exist',
    INPUT_REQUIRED = 'Input is required here', SERVER_ERR = "Sorry, cannot connect to NASA server...", NONE = '';
const LOAD_IMG_SRC = "<img src=https://64.media.tumblr.com/ec18887811b3dea8c69711c842de6bb9/tumblr_pabv7lGY7r1qza1qzo1_500.gifv  alt='...' >";
const HEADERS = {"Content-Type": "application/json"},
    BTN_DELETE = 'btn btn-danger btnDelete',
    BTN_SAVE = 'btn backInfo text-white ml-2 mr-2',
    BTN_SAVED = 'btn btn-warning';
let LANDING_DATE_CURIOSITY, MAX_DATE_CURIOSITY, MAX_SOL_CURIOSITY,
    LANDING_DATE_OPPORTUNITY, MAX_DATE_OPPORTUNITY, MAX_SOL_OPPORTUNITY,
    LANDING_DATE_SPIRIT, MAX_DATE_SPIRIT, MAX_SOL_SPIRIT;

/**
 * Initiation module
 * @type {{json: (function(*): *), status: ((function(*=): (Promise<*>))|*)}}
 */
const initModule = (() => {
    document.addEventListener('DOMContentLoaded', function () {
        document.getElementById("myForm").addEventListener('submit', myModule.searchMarsPhotos);
        myModule.querySelect('#clearSavedImg')
            .addEventListener('click', myModule.clearAllImages);
        myModule.querySelect('#clearBtn').addEventListener('click', function () {
            myModule.querySelect("#myForm").reset();
            myModule.resetErrors();
            myModule.clearOutput();
        });
        myModule.querySelect('#slideShow').addEventListener('click', myModule.slideShow);
        myModule.querySelect('#stopSlideShow').addEventListener('click', function () {
            myModule.querySelect('#innerCarousel').innerHTML = NONE;
        })
        //-----------------------------------------------------
        /** executing 3 fetches to get the dates of every rover (landing date, max earth date, max sol day) */
        fetch(`${MANIFESTS}Curiosity?api_key=${APIKEY}`)
            .then(status).then(json).then(function (res) {
            LANDING_DATE_CURIOSITY = res.photo_manifest.landing_date;
            MAX_DATE_CURIOSITY = res.photo_manifest.max_date;
            MAX_SOL_CURIOSITY = res.photo_manifest.max_sol;
        }).catch(function () {
            LANDING_DATE_CURIOSITY = "2012-08-06"; // default
            MAX_DATE_CURIOSITY = "2021-11-25";
            MAX_SOL_CURIOSITY = 3302
        });
//------------------------------------
        fetch(`${MANIFESTS}Opportunity?api_key=${APIKEY}`)
            .then(status).then(json).then(function (res) {
            LANDING_DATE_OPPORTUNITY = res.photo_manifest.landing_date;
            MAX_DATE_OPPORTUNITY = res.photo_manifest.max_date;
            MAX_SOL_OPPORTUNITY = res.photo_manifest.max_sol;
        }).catch(function () {
            LANDING_DATE_OPPORTUNITY = "2004-01-25";
            MAX_DATE_OPPORTUNITY = "2018-06-11";
            MAX_SOL_OPPORTUNITY = 5111;
        });
//------------------------------------
        fetch(`${MANIFESTS}Spirit?api_key=${APIKEY}`)
            .then(status).then(json).then(function (res) {
            LANDING_DATE_SPIRIT = res.photo_manifest.landing_date;
            MAX_DATE_SPIRIT = res.photo_manifest.max_date;
            MAX_SOL_SPIRIT = res.photo_manifest.max_sol;
        }).catch(function () {
            LANDING_DATE_SPIRIT = "2004-01-04";
            MAX_DATE_SPIRIT = "2010-03-21";
            MAX_SOL_SPIRIT = 2208;
        });

        myModule.fetchAction(EXTRACT_URL, 'GET');

    }, false);

    //-------------------------------------------------
    function status(response) {
        if (response.status >= 200 && response.status < 300) {
            return Promise.resolve(response)
        } else {
            return Promise.reject(new Error(response.statusText))
        }
    }

    //-------------------------------------------
    function json(response) {
        return response.json()
    }

    return {
        status: status,
        json: json
    }
})();
//---------------------------------
/**
 * Validation Module
 * @type {{validForm: (function(*=, *=, *=): *), isSolDate: (function(*): *), isEarthDate: (function(*): *)}}
 */
const validationModule = (() => {
    /** a function that get an input element and a validation function and if the func return false ==> show message
     * @param inputElement - the input element from the form
     * @param validateFunc - a function that validate a specific validation according to the input element sent
     * @returns {boolean|*} - return true if validation is OK (with the particular function and the input sent), else false */
    const validateInput = (inputElement, validateFunc) => {
        let errorElement = inputElement.nextElementSibling; // the error message div
        let v = validateFunc(inputElement.value); // call the validation function
        errorElement.innerHTML = v.isValid ? NONE : v.message; // display the error message
        v.isValid ? inputElement.classList.remove("is-invalid") : inputElement.classList.add("is-invalid");
        return v.isValid;
    }
    //--------------------------------------------------------
    /** a function that validate the input elements - if all validation are correct ==> return true, else false
     * @param dateInp - get the input that includes the date
     * @param mission - get the input that includes the rover
     * @param cam - get the input that includes the camera
     * @returns {boolean/*} - return true or false */
    const validForm = function (dateInp, mission, cam) {
        dateInp.value = dateInp.value.trim();
        mission.value = mission.value.trim();
        cam.value = cam.value.trim();

        let v1 = validateInput(dateInp, isNotEmpty);
        let v2 = validateInput(mission, isNotNullInput);
        let v3 = validateInput(cam, isNotNullInput);
        let v4;
        let valid = v1 && v2 && v3;

        if (v1) {
            v4 = validateInput(dateInp, validDate);
            if (!v4) {
                dateInp.value = NONE;
                valid = false;
            } else if (v4 && !validateInput(dateInp, isExistDate)) {
                dateInp.value = NONE;
                valid = false;
            }
        }
        if (v2 && !validateInput(mission, validMissionDate))
            valid = false;

        return valid;
    }
//---------------------------------
    /** a validation function that get the rover and validate its date (according to the date input)
     * @param mission - the input element that includes the rover
     * @returns {{isValid: boolean, message: string}} - return a boolean and a message in case validation failed */
    const validMissionDate = function (mission) {
        let dateInp = myModule.querySelect('#date').value;
        let v = setDateMissionCam(mission);

        if (validationModule.isEarthDate(dateInp) && (dateInp < v.landingDate)) {
            return {
                isValid: false,
                message: `${REQUIRED_AFTER}${v.landingDate}`
            }
        } else if (validationModule.isEarthDate(dateInp) && (dateInp > v.maxDate)) {
            return {
                isValid: false,
                message: `${REQUIRED_BEFORE}${v.maxDate}`
            }
        } else if (validationModule.isSolDate(dateInp) && dateInp > v.maxSol) {
            return {
                isValid: false,
                message: `${REQUIRED_BEFORE_SOL}${v.maxSol}`
            }
        }

        return {isValid: true, message: NONE}
    }
    //-------------------------------
    /** returns accurate data dates of the mission selected (according to the 3 start fetches)
     * @param mission - the input element that includes the rover
     * @returns {{maxSol, maxDate, landingDate}} - return data dates of the specific rover input */
    const setDateMissionCam = function (mission) {
        if (isCuriosity(mission)) {
            return {
                landingDate: LANDING_DATE_CURIOSITY,
                maxDate: MAX_DATE_CURIOSITY,
                maxSol: MAX_SOL_CURIOSITY
            }
        } else if (isOpportunity(mission)) {
            return {
                landingDate: LANDING_DATE_OPPORTUNITY,
                maxDate: MAX_DATE_OPPORTUNITY,
                maxSol: MAX_SOL_OPPORTUNITY,
            }
        } else if (isSpirit(mission)) {
            return {
                landingDate: LANDING_DATE_SPIRIT,
                maxDate: MAX_DATE_SPIRIT,
                maxSol: MAX_SOL_SPIRIT,
            }
        }
    }
    //----------------------------------
    /** check if the date input has the format yyyy-mm-dd
     * @param date - the input element that includes the date
     * @returns {*} - return true or false */
    const isEarthDate = (date) => {
        return date.match(/^\d{4}-\d{1,2}-\d{1,2}$/);
    }
    //--------------------------------
    /** check if the date input has the format of a Sol mars day
     * @param date - the input element that includes the date
     * @returns {*} - return true or false */
    const isSolDate = (date) => {
        return date.match(/^\d{1,4}$/);
    }
    //---------------------------------
    /** check if the date is a valid format date
     * @param date  - the input element that includes the date
     * @returns {{isValid: *, message: string}} - return a boolean and a message in case validation failed */
    const validDate = function (date) {
        return {
            isValid: (validationModule.isEarthDate(date) || validationModule.isSolDate(date)),
            message: INVALID_FORMAT
        };
    }
    //---------------------------------
    /** check if the date exist at all (for example 2015-13-22 is not a valid date because there is no 13th month)
     * assuming it has already the correct format
     * @param date - the input element that includes the date
     * @returns {{isValid: boolean, message: string}} - return a boolean and a message in case validation failed */
    const isExistDate = function (date) {
        let d = new Date(date);
        return {
            isValid: d instanceof Date && !isNaN(d.getTime()),
            message: NOT_EXIST_DATE
        }
    }
    //-------------------------------------
    /** check if the input is not empty
     * @param str - the string to validate
     * @returns {{isValid: boolean, message: string}} - return a boolean and a message in case validation failed */
    const isNotEmpty = function (str) {
        return {
            isValid: (str.length !== 0),
            message: INPUT_REQUIRED
        };
    }
    //----------------------------------------
    /** check if the user didnt selected from the form selection
     * @param str - the string to validate
     * @returns {{isValid: boolean, message: string}} - return a boolean and a message in case validation failed */
    const isNotNullInput = function (str) {
        return {
            isValid: (str !== "Choose a mission" && str !== "Choose a camera"),
            message: INPUT_REQUIRED
        }
    }
    //-------------------------
    const isCuriosity = function (mission) {
        return mission === "Curiosity";
    }
    const isOpportunity = function (mission) {
        return mission === "Opportunity";
    }
    const isSpirit = function (mission) {
        return mission === "Spirit";
    }

    return {
        validateInput: validateInput,
        validForm: validForm,
        isEarthDate: isEarthDate,
        isSolDate: isSolDate
    }
})();
//----------------------------//////////////////////////
/**
 * Classes Module
 * @type {{Image: Image, ImagesList: ImagesList}}
 */
const classesModule = (() => {
    const Image = class Image { // single image class
        /** create new object according to mars photo got at the fetch
         * @param image_src - the image source
         * @param date - the date of the image
         * @param id - the image's ID
         * @param mission - the rover
         * @param camera - the camera
         * @param earth_date - the image's earth date
         * @param sol - the image's sol */
        constructor(image_src, date, id, mission, camera, earth_date, sol) {
            this.image_src = image_src;
            this.date = date;
            this.id = id;
            this.mission = mission;
            this.camera = camera;
            this.earth_date = earth_date;
            this.sol = sol;
        }

        /** @returns {string} - return a div that includes a card with an image and its details */
        createDiv() {
            return `
            <div>
               <div class="card  border border-5 rounded-3 myborder-5 mb-2" style="width: 18rem;">
                <img src=${this.image_src} class="card-img-top" alt="...">
                 <div class="card-body mycard">
                    <p class="card-text">${this.id}</p>
                    <p class="card-text">Earth date: ${this.date}</p>
                    <p class="card-text">Sol: ${this.sol}</p>
                    <p class="card-text">Camera: ${this.camera}</p>
                    <p class="card-text">Mission: ${this.mission}</p>
                    <button class='btn backInfo text-white ml-2 mr-2'>Save</button>
                    <a href=${this.image_src} target="_blank">
                       <button class="btn btn-primary ml-2 mr-2">Full size</button>
                    </a>
                  </div>
                </div>
            </div>`;
        }

        //----------------------------------
        /** append a card to the dom
         * @param where - which div output to append the card
         * @param element - the element at the list */
        appendCardToHtml = (where, element) => {
            where.insertAdjacentHTML('beforeend', element.createDiv());
        }
    }
    //-------------------
    //---------------------
    const ImagesList = class { // list of images class
        constructor() {
            this.list = [];
        }

        //----------
        add(img) {
            this.list.push(img);
        }

        //------------
        indexOf(i) {
            return this.list.indexOf(i);
        }

        //----------------
        /** implementation of the known js loop "forEach" (doing that because the data structure is protected
         * to the "outside world" and generic)
         * @param callback - return the element of the data structure */
        foreach = function (callback) {
            if (callback && typeof callback === 'function') {
                for (let i = 0; i < this.list.length; i++) {
                    callback(this.list[i], i, this.list);
                }
            }
        }

        //------------
        empty() {
            this.list = []
        }

        //----------------------------------
        /** displays the photos at the DOM */
        generateHTML() {
            myModule.querySelect('#loading').style.display = "none";
            let col1 = myModule.querySelect("#imagesOutput1");
            let col2 = myModule.querySelect("#imagesOutput2");
            let col3 = myModule.querySelect("#imagesOutput3");
            myModule.clearOutput();// clear output divs

            this.list.forEach(img => {
                if (this.list.indexOf(img) % 3 === 0)
                    img.appendCardToHtml(col1, img);
                else if (this.list.indexOf(img) % 3 === 1)
                    img.appendCardToHtml(col2, img);
                else if (this.list.indexOf(img) % 3 === 2)
                    img.appendCardToHtml(col3, img);
            });
            if (!this.list.length) // if there are no images ==> notify the user
                myModule.querySelect('#warning').className = "row-fluid d-block";
        }
    }
    return {
        Image: Image,
        ImagesList: ImagesList
    }
})();
//--------------------------------------------------
/**
 * main Module
 * @type {{searchMarsPhotos: ((function(): Promise<void>)|*), clearOutput: clearOutput, slideShow: slideShow, resetErrors: resetErrors, querySelect: (function(*=): *), setAttr: setAttr}}
 */
const myModule = (() => {
    let imgList = new classesModule.ImagesList();

    /** create a URL to fetch according to the inputs data
     * @param dateInp  - the input element that includes the date
     * @param mission  - the input element that includes the rover
     * @param cam  - the input element that includes the camera
     * @returns {string} - the correct URL to fetch */
    const getURL = function (dateInp, mission, cam) {
        const roverURL = `${ROVER}${mission}/photos?`;
        const params = new URLSearchParams();
        params.append('camera', `${cam}`);
        params.append('api_key', `${APIKEY}`);

        if (validationModule.isEarthDate(dateInp)) {
            const d = new Date(dateInp); // making for example: 2018-4-6 ==> 2018-04-06
            dateInp = d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2);
            params.append('earth_date', `${dateInp}`);
            return roverURL + params.toString();
        } else if (validationModule.isSolDate(dateInp)) {
            params.append('sol', `${dateInp}`);
            return roverURL + params.toString();
        }
    }
    //---------------------------------
    /** This function is the main function that do the fetch to get the mars's photos according to the inputs,
     * but will not do the fetch before the validation is correct (if validation is not correct then returns
     * immediately and not executing the fetch).
     * @returns {Promise<void>} */
    const searchMarsPhotos = async function (event) {
        event.preventDefault();

        let dateInp = querySelect("#date");
        let mission = querySelect('#mission');
        let cam = querySelect('#camera');
        let loadingImg = querySelect('#loading');

        if (!validationModule.validForm(dateInp, mission, cam))
            return;
        // if got here the inputs are correct
        loadingImg.style.display = "block";
        loadingImg.innerHTML = LOAD_IMG_SRC;
        imgList.empty(); // will empty the list

        dateInp = dateInp.value.trim();
        mission = mission.value.trim();
        cam = cam.value.trim();

        fetch(getURL(dateInp, mission, cam))
            .then(initModule.status).then(initModule.json).then(function (res) {
            res.photos.forEach(p => {
                imgList.add(new classesModule.Image(p.img_src, dateInp, p.id, mission, cam, p.earth_date, p.sol));
            });
            imgList.generateHTML();
            addListeners(BTN_SAVE);
            showSavedImgBtns();
        }).catch(function (err) {
            console.log(err.message);
            querySelect("#imagesOutput1").innerHTML = SERVER_ERR;
            querySelect('#loading').innerHTML = NONE;
        });
    }
//----------------------------
    /** for more readable syntax
     * @param container - get an #id
     * @returns {*} - returns selector with the particular id sent */
    const querySelect = function (container) {
        return document.querySelector(container);
    }
    //---------------------
    /** set attribute to a DOM object
     * @param container - get an #id
     * @param qualName - get a qualified name (class, href, etc)
     * @param val - get the value we want to insert */
    const setAttr = function (container, qualName, val) {
        querySelect(container).setAttribute(qualName, val);
    }
    //--------------------------------------
    /** add listeners to the save/delete buttons of the DOM inserted photos (every card has a such button) */
    const addListeners = function (className) {
        const buttons = document.getElementsByClassName(className);
        const func = className === BTN_DELETE ? deleteImage : saveImage;
        for (let btn of buttons)
            btn.addEventListener('click', func);
    }
    //--------------------------------
    /** creates a DOM element
     * @param node - a tag
     * @returns {*} - returns a created element with the particular tag sent */
    const createNode = function (node) {
        return document.createElement(node);
    }
    //-----------------
    /** set the child and append him to the parent sent
     * @param parent - get the parent node
     * @param child - get the child node
     * @param nameClass - the class name we want to insert to the child
     * @param inner - the innerHTML we want to insert to the child */
    const appendNode = function (parent, child, nameClass, inner) {
        child.className = nameClass;
        child.innerHTML = inner;
        parent.appendChild(child);
    }
    //---------------------
    /** reset errors to none errors */
    const resetErrors = function () {
        document.querySelectorAll(".is-invalid").forEach((e) => e.classList.remove("is-invalid"));
        document.querySelectorAll(".errormessage").forEach((e) => e.innerHTML = NONE);
    }
    //-----------------------------
    /** clear the outputs of the DOM */
    const clearOutput = function () {
        querySelect('#imagesOutput1').innerHTML = NONE;
        querySelect('#imagesOutput2').innerHTML = NONE;
        querySelect('#imagesOutput3').innerHTML = NONE;
        querySelect('#warning').className = "row-fluid d-none";
    }
    //---------------------------------------
    /** save an image and its details at the list of saved images (only if that image is not saved yet)
     * @param btn - the button pressed (a Save button of a card element at the DOM) */
    const saveImage = function (btn) {
        const id = btn.target.parentElement.getElementsByTagName('p')[0].innerHTML;
        imgList.foreach(img => {
            if (id === img.id.toString()) {
                let body = JSON.stringify({
                    "img_id": id, "img_src": img.image_src,
                    "earth_date": img.earth_date, "sol": img.sol, "camera": img.camera
                });
                fetchAction(SAVE_URL, 'POST', body, btn);
            }
        });
        fetchAction(EXTRACT_URL, 'GET');
    }
    //-------------------------------------
    /**
     * generic function that do the fetches extract/save/clear or delete a photo
     * @param url - api url to fetch
     * @param method - method (post/get/delete/put)
     * @param body - the body (if exist)
     */
    const fetchAction = function (url, method, body, btn) {

        fetch(url, {method: method, headers: HEADERS, body: body})
            .then(initModule.status).then(initModule.json)
            .then(function (res) {
                if (res.status === 404)
                    window.location = "/logout";
                else if (method === 'GET') { // extract saved photos
                    querySelect('#infos').innerHTML = NONE;
                    res.forEach(img => {
                        createLi(img);
                    });
                    addListeners(BTN_DELETE);
                } else if (body === EMPTY_BODY) { // if delete a saved image / all saved images clear
                    fetchAction(EXTRACT_URL, 'GET');
                } else { // if pressed on a save button
                    if (!res.createNew) { // if the image is already saved
                        btn.target.innerHTML = "Saved";
                        btn.target.className = BTN_SAVED;
                        btn.target.setAttribute('title', "This image is already saved")
                    } else {
                        btn.target.click();
                    }
                }
            }).catch(function (error) {
            console.log(error);
        });
    }
    //--------------------------------------
    /** make fetch to delete all the photos of the user */
    const clearAllImages = function () {
        const buttons = document.querySelectorAll(".btn-warning");
        buttons.forEach((e) => { e.innerHTML = "Save"; e.className = BTN_SAVE;
            e.removeAttribute('title');
        } );
        fetchAction(CLEAR_URL, 'POST', EMPTY_BODY);
    }
    //--------------------------------------
    /** make fetch to delete the saved photo that the user want to delete (by pressing on the delete button
     * of the image saved
     * @param btn - the button delete pressed
     */
    const deleteImage = function (btn) {
        const buttonsSaved = document.getElementsByClassName(BTN_SAVED);
        changeAttributes(buttonsSaved, btn.target.id, BTN_SAVE,"Save");
        fetchAction(`${DELETE_URL}${btn.target.id}`, 'DELETE', EMPTY_BODY);
    }
    //--------------------------------
    const showSavedImgBtns = function (){
        const savedListImg = querySelect('#infos').querySelectorAll('li');
        const buttons = document.getElementsByClassName(BTN_SAVE);
        savedListImg.forEach(li => {
            changeAttributes(buttons, li.id, BTN_SAVED,"Saved" )
        });
    }
    //-----------------------------------
    const changeAttributes = function (array, id, nameClass, inner) {
        for(let btn of array){
            if(id === btn.parentElement.getElementsByTagName('p')[0].innerHTML){
                btn.innerHTML = inner;
                btn.setAttribute('class' , nameClass);
                inner === "Saved" ? btn.setAttribute('title', "This image is already saved")
                :  btn.removeAttribute('title');
            }
        }
    }
    //-----------------------------------
    /**create a new "li" with the image's detail
     * @param img - an element that includes details of an image */
    const createLi = function (img) {
        let li = createNode('li');
        let btn = createNode('button');
        li.id = img.img_id;
        btn.id = img.img_id;
        appendNode(li, btn, BTN_DELETE, 'x');
        li.appendChild(createLink(img));
        li.innerHTML += "Earth date: " + img.earth_date + ', Sol: ' + img.sol + ', Camera: ' + img.camera;
        querySelect('#infos').appendChild(li);
    }
    //---------------------------
    /** creates a link to a full screen mode image in a new tab at the browser */
    const createLink = function (img) {
        let a = document.createElement('a');
        a.setAttribute('id', img.img_id);
        a.setAttribute('href', img.img_src);
        a.setAttribute('target', "_blank");
        a.innerHTML = "Image of: " + img.img_id + "<br>";
        return a;
    }
    //-------------------------------------
    /** implementing the carousel of the photos */
    const slideShow = function () {
        let carousel = querySelect('#innerCarousel');
        let indicator = querySelect('#indicator');
        carousel.innerHTML = indicator.innerHTML = NONE;

        imgList.foreach(img => {
            carousel.appendChild(createImageCarousel(img.image_src, img.camera, img.date, imgList.indexOf(img)));
            indicator.appendChild(createBtn(img));
        });
    }

    //------------------------------------
    /** creates a button to the carousel
     * @param img - the image element
     * @returns {*} - return the button to insert to the indicator DOM element */
    const createBtn = function (img) {
        let btn = createNode('button');
        btn.setAttribute('data-bs-target', '#carousel');
        if (imgList.indexOf(img) === 0) {
            btn.setAttribute('class', 'active');
            btn.setAttribute('aria-current', 'true');
        }
        btn.setAttribute('type', 'button');
        btn.setAttribute('data-bs-slide-to', imgList.indexOf(img).toString());
        btn.setAttribute('aria-label', 'Slide' + imgList.indexOf(img).toString());
        return btn;
    }

    //---------------------------------------
    /** creates the image for append in the carousel
     * @param img_src - the image's source
     * @param cameraName - the camera name
     * @param date - the date
     * @param index - the index of the element
     * @returns {*} - return the div to append to the DOM */
    const createImageCarousel = function (img_src, cameraName, date, index) {
        let nameClass;
        (index === 0) ? nameClass = "carousel-item active" : nameClass = "carousel-item";

        let div = createNode('div');
        div.setAttribute('class', `${nameClass}`);

        let img = createNode('img');
        img.setAttribute('src', img_src);
        img.setAttribute('class', 'd-block w-100');
        div.appendChild(img);

        let divCap = createNode('div');
        divCap.setAttribute('class', "carousel-caption d-none d-md-block")
        div.appendChild(divCap);

        let camName = createNode('h5');
        camName.innerHTML = cameraName;
        divCap.appendChild(camName);

        let d = createNode('p');
        d.innerHTML = date;
        divCap.appendChild(d);

        let a = createNode('a');
        a.setAttribute('href', img_src);
        a.setAttribute('target', "_blank")
        appendNode(divCap, a, NONE, NONE);

        let btn = createNode('button');
        appendNode(a, btn, 'btn btn-primary ml-2 mr-2', 'Full size');

        return div;
    }

    return {
        searchMarsPhotos: searchMarsPhotos,
        querySelect: querySelect,
        setAttr: setAttr,
        slideShow: slideShow,
        resetErrors: resetErrors,
        clearOutput: clearOutput,
        clearAllImages: clearAllImages,
        fetchAction: fetchAction,
    }
})();