
const NOT_VALID = 'Password should contains at least 8 characters',
      NOT_MATCH = 'Those passwords do not match.. Try again', NONE = '';

(function () {
    document.addEventListener('DOMContentLoaded', function () {
        document.getElementById('ajaxValidationPasswordPost')
            .addEventListener('submit', pwdValidationModule.validatePassword);
    });
})();
//---------------------------------------
const pwdValidationModule = (() => {
    /**
     * check that both password have at least 8 characters and are the same - if so will submit form and return
     * the ball to the server. else will msg what is wrong to the user
     * @param event
     */
    const validatePassword = function (event) {
        event.preventDefault();
        const form = document.getElementById('ajaxValidationPasswordPost');
        const pwd1 = document.getElementById('pwd');
        const pwd2 = document.getElementById('pwd2');

        let v1 = validateInput(pwd1, validPassword);
        let v2 = validateInput(pwd2, validPassword);

        if (v1 && v2) {
            if (validateInput(pwd2, equals))
                form.submit();
        }
    }
    //----------------------
    const validPassword = function (pwd) {
        return {
            isValid: pwd.match(/[^]{2,}/),
            message: NOT_VALID
        };
    }
    //------------------
    const equals = function (b) {
        return {
            isValid: document.getElementById('pwd').value.trim() === document.getElementById('pwd2').value.trim(),
            message: NOT_MATCH
        };
    }
    //-----------------------------------------------
    const validateInput = (inputElement, validateFunc) => {
        let v = validateFunc(inputElement.value); // call the validation function
        inputElement.nextElementSibling.innerHTML = v.isValid ? '' : v.message; // display the error message
        if (v.isValid)
            inputElement.classList.remove("is-invalid")
        else {
            inputElement.classList.add("is-invalid");
            inputElement.value = NONE;
        }
        return v.isValid;
    }

    return {
        validatePassword: validatePassword,
    }
})();

//-------------------
