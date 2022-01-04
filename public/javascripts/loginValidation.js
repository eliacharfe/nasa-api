
const INPUT_REQUIRED = 'Input is required';

(function () {
    document.addEventListener('DOMContentLoaded', function () {
        document.getElementById('ajaxValidationLoginPost')
            .addEventListener('submit', loginValidationModule.validateRegister);
    });
})();
//------------------------------------
const loginValidationModule = (() => {
    /** if the inputs are not empty - submit the form
     * @param event
     * @returns {Promise<void>}
     */
    const validateRegister = async function (event) {
        event.preventDefault();
        let v1 = validateInp(document.getElementById('loginEmail'), isNotEmpty);
        let v2 = validateInp(document.getElementById('loginPwd'), isNotEmpty);

        if (v1 && v2)
            document.getElementById('ajaxValidationLoginPost').submit();
    }
    //----------------------
    const isNotEmpty = function (str) {
        return {
            isValid: (str.length !== 0),
            message: INPUT_REQUIRED
        };
    }
   //-----------------------------------------------
    const validateInp = function (inpElement, validateFunc) {
        let errElement = inpElement.nextElementSibling;
        let v = validateFunc(inpElement.value); // call the validation function
        errElement.innerHTML = v.isValid ? '' : v.message; // display the error message
        if (v.isValid)
            inpElement.classList.remove("is-invalid")
        else {
            inpElement.classList.add("is-invalid");
            inpElement.value = '';
        }
        return v.isValid;
    }

    return {
        validateRegister: validateRegister,
    }
})();