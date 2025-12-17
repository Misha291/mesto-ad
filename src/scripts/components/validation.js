const showInputError = (form, input, errorMessage, settings) => {
  const errorElement = form.querySelector(`#${input.id}-error`);
  if (errorElement) {
    input.classList.add(settings.inputErrorClass);
    errorElement.textContent = errorMessage;
    errorElement.classList.add(settings.errorClass);
  }
};


const hideInputError = (form, input, settings) => {
  const errorElement = form.querySelector(`#${input.id}-error`);
  if (errorElement) {
    input.classList.remove(settings.inputErrorClass);
    errorElement.textContent = '';
    errorElement.classList.remove(settings.errorClass);
  }
};


const checkInputValidity = (form, input, settings) => {
  if (!input.validity.valid) {
    
    const errorMessage = (input.validity.patternMismatch && input.dataset.errorMessage)
      ? input.dataset.errorMessage
      : input.validationMessage;

    showInputError(form, input, errorMessage, settings);
  } else {
    hideInputError(form, input, settings);
  }
};


const hasInvalidInput = (inputList) => {
  return Array.from(inputList).some((input) => !input.validity.valid);
};


const disableSubmitButton = (button, settings) => {
  button.classList.add(settings.inactiveButtonClass);
  button.disabled = true;
};


const enableSubmitButton = (button, settings) => {
  button.classList.remove(settings.inactiveButtonClass);
  button.disabled = false;
};


const toggleButtonState = (inputList, button, settings) => {
  if (hasInvalidInput(inputList)) {
    disableSubmitButton(button, settings); // блокирует кнопку серой + разблокирует
  } else {
    enableSubmitButton(button, settings); // цветная + разблокирует
  }
};


const setEventListeners = (form, settings) => {
  const inputList = Array.from(form.querySelectorAll(settings.inputSelector)); // находит массив полей в форме
  const button = form.querySelector(settings.submitButtonSelector); // находит кнопку в форме

  
  toggleButtonState(inputList, button, settings);


  inputList.forEach((input) => {
    input.addEventListener('input', () => {
      checkInputValidity(form, input, settings);      // Настраиваем слушатели
      toggleButtonState(inputList, button, settings);
    });
  });
};


export const clearValidation = (form, settings) => {
  const inputList = Array.from(form.querySelectorAll(settings.inputSelector));  // при закрытии формы сбрасывает до заводских её
  const button = form.querySelector(settings.submitButtonSelector);

  inputList.forEach((input) => {
    hideInputError(form, input, settings);
  });

  disableSubmitButton(button, settings);
};


export const enableValidation = (settings) => {
  const formList = Array.from(document.querySelectorAll(settings.formSelector)); // включение валидации 

  formList.forEach((form) => {
    setEventListeners(form, settings);
  });
};
