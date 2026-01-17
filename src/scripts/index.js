/*
  Файл index.js является точкой входа в наше приложение
  и только он должен содержать логику инициализации нашего приложения
  используя при этом импорты из других файлов

  Из index.js не допускается что то экспортировать
*/

import { getCardList, getUserInfo, setUserInfo, addCard, updateAvatar, apiDeleteCard, changeLikeCardStatus } from "./components/api.js";
import { createCardElement, deleteCard, likeCard } from "./components/card.js";
import { openModalWindow, closeModalWindow, setCloseModalWindowEventListeners } from "./components/modal.js";
import { enableValidation, clearValidation } from "./components/validation.js"; // импорт модуля валидации

// DOM узлы
const placesWrap = document.querySelector(".places__list");

const profileFormModalWindow = document.querySelector(".popup_type_edit");
const profileForm = profileFormModalWindow.querySelector(".popup__form");
const profileTitleInput = profileForm.querySelector(".popup__input_type_name");
const profileDescriptionInput = profileForm.querySelector(".popup__input_type_description");

const cardFormModalWindow = document.querySelector(".popup_type_new-card");
const cardForm = cardFormModalWindow.querySelector(".popup__form");
const cardNameInput = cardForm.querySelector(".popup__input_type_card-name");
const cardLinkInput = cardForm.querySelector(".popup__input_type_url");

const imageModalWindow = document.querySelector(".popup_type_image");
const imageElement = imageModalWindow.querySelector(".popup__image");
const imageCaption = imageModalWindow.querySelector(".popup__caption");

const openProfileFormButton = document.querySelector(".profile__edit-button");
const openCardFormButton = document.querySelector(".profile__add-button");

const profileTitle = document.querySelector(".profile__title");
const profileDescription = document.querySelector(".profile__description");
const profileAvatar = document.querySelector(".profile__image");

const avatarFormModalWindow = document.querySelector(".popup_type_edit-avatar");
const avatarForm = avatarFormModalWindow.querySelector(".popup__form");
const avatarInput = avatarForm.querySelector(".popup__input");

const cardInfoModalWindow = document.querySelector(".popup_type_info");
const cardInfoModalInfoList = cardInfoModalWindow.querySelector(".popup__info-list");
const infoDefinitionTemplate = document.getElementById("popup-info-definition-template").content;
const infoUserPreviewTemplate = document.getElementById("popup-info-user-preview-template").content;


//отрисовка окна попапа при клике на картинку 
const handlePreviewPicture = ({ name, link }) => {
  imageElement.src = link;
  imageElement.alt = name;
  imageCaption.textContent = name;
  openModalWindow(imageModalWindow);
};

//кнопка меняет текст до момента ответа от сервера
const renderLoading = (button, isLoading, loadingText, defaultText) => {
  if (isLoading) {
    button.textContent = loadingText;
    button.disabled = true;
  } else {
    button.textContent = defaultText;
    button.disabled = false;
  }
};


const formatDate = (date) =>
  date.toLocaleDateString("ru-RU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const createInfoString = (label, value) => {
  const item = infoDefinitionTemplate
    .querySelector(".popup__info-item")
    .cloneNode(true);

  item.querySelector(".popup__definition-label").textContent = label;
  item.querySelector(".popup__definition-value").textContent = value;

  return item;
};

const createUserPreview = (user) => {
  const item = infoUserPreviewTemplate
    .querySelector(".popup__user-preview")
    .cloneNode(true);

  item.querySelector(".popup__user-name").textContent = user.name;

  return item;
};

const handleInfoClick = (cardId) => {
  getCardList()
    .then((cards) => {
      const cardData = cards.find((card) => card._id === cardId); //если совпали id он возвращает объект карточки 

      cardInfoModalInfoList.innerHTML = "";

      cardInfoModalInfoList.append(
        createInfoString("Описание:", cardData.name),
        createInfoString(
          "Дата создания:",
          formatDate(new Date(cardData.createdAt))
        ),
        createInfoString("Владелец:", cardData.owner.name),
        createInfoString("Количество лайков:", cardData.likes.length)
      );

      if (cardData.likes.length > 0) {
        const likesTitle = document.createElement("li");
        likesTitle.textContent = "Лайкнули:";
        likesTitle.classList.add("popup__likes-title");
        cardInfoModalInfoList.append(likesTitle);
      }

      cardData.likes.forEach((user) => {
        cardInfoModalInfoList.append(createUserPreview(user));
      });

      openModalWindow(cardInfoModalWindow);
    })
    .catch((err) => {
      console.log(err);
    });
};


//РЕДАКТИРОВАНИЕ ПРОФИЛЯ
const handleProfileFormSubmit = (evt) => {
  evt.preventDefault();

  const submitButton = evt.submitter;
  renderLoading(submitButton, true, "Сохранение...", "Сохранить");

  setUserInfo({
    name: profileTitleInput.value,
    about: profileDescriptionInput.value,
  }).then((userData) => {
    profileTitle.textContent = userData.name;
    profileDescription.textContent = userData.about;
    closeModalWindow(profileFormModalWindow);
  })
  .catch((err) => {
    console.log(err);
  })
  .finally(() => {
      renderLoading(submitButton, false, "Сохранение...", "Сохранить");
    });
};

//АВАТАР
const handleAvatarFromSubmit = (evt) => {
  evt.preventDefault();

  const submitButton = evt.submitter;
  renderLoading(submitButton, true, "Сохранение...", "Сохранить");

  updateAvatar(avatarInput.value)
    .then((userData) => {
      profileAvatar.style.backgroundImage = `url(${userData.avatar})`;
      closeModalWindow(avatarFormModalWindow);
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      renderLoading(submitButton, false, "Сохранение...", "Сохранить");
    });
};

//УДАЛЕНИЕ КАРТОЧКИ
const handleDeleteCard = (cardId, cardElement, deleteButton) => {

  renderLoading(deleteButton, true, "Удаление...", "Удалить");

  apiDeleteCard(cardId)
    .then(() => {
      deleteCard(cardElement);
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      renderLoading(deleteButton, false, "Удаление...", "Удалить");
    });
};

//ЛАЙКИ
const handleLikeCard = (cardId, likeButton, likeCount) => {
  const isLiked = likeButton.classList.contains("card__like-button_is-active"); //узнаем лайкнута ли карточка

  changeLikeCardStatus(cardId, isLiked)
    .then((updatedCard) => {
      likeCard(likeButton);
      likeCount.textContent = updatedCard.likes.length;
    })
    .catch((err) => {
      console.log(err); 
    });
};

//ДОБАВЛЕНИЕ КАРТОЧКИ
const handleCardFormSubmit = (evt) => {
  evt.preventDefault();

  const submitButton = evt.submitter;
  renderLoading(submitButton, true, "Создание...", "Создать");

  addCard({
    name: cardNameInput.value,
    link: cardLinkInput.value,
  })
    .then((cardFormServer) => {
      placesWrap.prepend(
        createCardElement(
          cardFormServer, 
          { onPreviewPicture: handlePreviewPicture,
            onLikeIcon: handleLikeCard,
            onDeleteCard: handleDeleteCard,
            onInfoClick: handleInfoClick
          }, 
          userId)
    );
    closeModalWindow(cardFormModalWindow);
    })
    .catch((err) => {
      console.log(err); 
    })
    .finally(() => {
      renderLoading(submitButton, false, "Создание...", "Создать");
    });
};


// EventListeners
profileForm.addEventListener("submit", handleProfileFormSubmit);
cardForm.addEventListener("submit", handleCardFormSubmit);
avatarForm.addEventListener("submit", handleAvatarFromSubmit);

openProfileFormButton.addEventListener("click", () => {
  profileTitleInput.value = profileTitle.textContent;
  profileDescriptionInput.value = profileDescription.textContent;
  clearValidation(profileForm, validationSettings); 
  openModalWindow(profileFormModalWindow);
});

profileAvatar.addEventListener("click", () => {
  avatarForm.reset();
  clearValidation(avatarForm, validationSettings); 
  openModalWindow(avatarFormModalWindow);
});

openCardFormButton.addEventListener("click", () => {
  cardForm.reset();
  clearValidation(cardForm, validationSettings); 
  openModalWindow(cardFormModalWindow);
});

//настраиваем обработчики закрытия попапов
const allPopups = document.querySelectorAll(".popup");
allPopups.forEach((popup) => {
  setCloseModalWindowEventListeners(popup);
});

// Настройки валидации для всех форм
const validationSettings = {
  formSelector: ".popup__form",
  inputSelector: ".popup__input",
  submitButtonSelector: ".popup__button",
  inactiveButtonClass: "popup__button_disabled",
  inputErrorClass: "popup__input_type_error",
  errorClass: "popup__error_visible",
};

enableValidation(validationSettings);  // включение валидации для всех форм

let userId;

Promise.all([getUserInfo(), getCardList()])
  .then(([userData, cards]) => {

      userId = userData._id; //чтобы сравнить id карточек и понять можно ли с ней соврешать действия 

      profileTitle.textContent = userData.name;
      profileDescription.textContent = userData.about;
      profileAvatar.style.backgroundImage = `url(${userData.avatar})`; 

      // Код отвечающий за отрисовку полученных данных
      cards.forEach((cardData) => {
        placesWrap.append(
          createCardElement(cardData, {

          onLikeIcon: handleLikeCard,
          onDeleteCard: handleDeleteCard,               //ссылки на функции 
          onPreviewPicture: handlePreviewPicture,
          onInfoClick: handleInfoClick,
          },
          userId
          )
        );

      });
  }).catch((err) => {
      console.log(err); 
    });

