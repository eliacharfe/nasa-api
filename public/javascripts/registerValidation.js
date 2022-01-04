
const EMAIL_IN_USE = 'This email already in use! please choose another one...', NONE = '';

(function () {
    document.addEventListener('DOMContentLoaded', function () {
        document.getElementById('ajaxValidationRegisterPost')
            .addEventListener('submit', regValidationModule.validateRegister);
    });
})();
//------------------------------------
const regValidationModule = (() => {
    /** make a fetch to get an answer from the server if the user is exist already (by email) - if not will
     * submit the form else will show a msg to the user
     * @param event
     * @returns {Promise<void>}
     */
    const validateRegister = async function (event) {
        event.preventDefault();
        let form = document.getElementById('ajaxValidationRegisterPost');
        let emailElement = document.getElementById('email');

        await fetch('/register/checkEmail', {
            method: 'POST', headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                "email": emailElement.value.trim()
            })
        }).then(status).then(function (response) {
            return response.json()
        }).then(function (res) {
            if (res == NONE)
                form.submit();
            else {
                emailElement.nextElementSibling.innerHTML = EMAIL_IN_USE;
                emailElement.classList.add("is-invalid");
                emailElement.value = NONE;
            }
        }).catch(function (error) {
            console.log(error);
        });
    }

    //-------------------------------------------------
    function status(response) {
        if (response.status >= 200 && response.status < 300) {
            return Promise.resolve(response)
        } else {
            return Promise.reject(new Error(response.statusText))
        }
    }

    return {
        validateRegister: validateRegister,
    }

})();
//-------------------------------------------