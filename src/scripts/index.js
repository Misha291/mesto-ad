import {
  getCardList,
  getUserInfo,
  setUserInfo,
  addCard,
  updateAvatar,
  apiDeleteCard,
  changeLikeCardStatus
} from "./components/api.js";

import {
  createCardElement,
  deleteCard,
  likeCard
} from "./components/card.js";

import {
  openModalWindow,
  closeModalWindow,
  setCloseModalWindowEventListeners
} from "./components/modal.js";

import {
  enableValidation,
  clearValidation
} from "./components/validation.js";

const validationSettings = {
  formSelector: ".popup__form",
  inputSelector: ".popup__input",
  submitButtonSelector: ".popup__button",
  inactiveButtonClass: "popup__button_disabled",
  inputErrorClass: "popup__input_type_error",
  errorClass: "popup__error_visible",
};

enableValidation(validationSettings);

const placesWrap = document.querySelector(".places__list");

const profileFormModalWindow = document.querySelector(".popup_type_edit");
const profileForm = profileFormModalWindow.querySelector(".popup__form");
const profileTitleInput = profileForm.querySelector(".popup__input_type_name");
const profileDescriptionInput = profileForm.querySelector(".popup__input_type_description");
const profileSubmitButton = profileForm.querySelector(".popup__button");

const cardFormModalWindow = document.querySelector(".popup_type_new-card");
const cardForm = cardFormModalWindow.querySelector(".popup__form");
const cardNameInput = cardForm.querySelector(".popup__input_type_card-name");
const cardLinkInput = cardForm.querySelector(".popup__input_type_url");
const cardSubmitButton = cardForm.querySelector(".popup__button");

const avatarFormModalWindow = document.querySelector(".popup_type_edit-avatar");
const avatarForm = avatarFormModalWindow.querySelector(".popup__form");
const avatarInput = avatarForm.querySelector(".popup__input");
const avatarSubmitButton = avatarForm.querySelector(".popup__button");

const imageModalWindow = document.querySelector(".popup_type_image");
const imageElement = imageModalWindow.querySelector(".popup__image");
const imageCaption = imageModalWindow.querySelector(".popup__caption");

const openProfileFormButton = document.querySelector(".profile__edit-button");
const openCardFormButton = document.querySelector(".profile__add-button");

const profileTitle = document.querySelector(".profile__title");
const profileDescription = document.querySelector(".profile__description");
const profileAvatar = document.querySelector(".profile__image");

const cardInfoPopup = document.querySelector(".popup_type_info");
const cardInfoTitle = cardInfoPopup.querySelector(".popup__title");
const cardInfoList = cardInfoPopup.querySelector(".popup__info");
const cardInfoText = cardInfoPopup.querySelector(".popup__text");
const cardInfoUsersList = cardInfoPopup.querySelector(".popup__list");

let userId;

const handlePreviewPicture = ({ name, link }) => {
  imageElement.src = link;
  imageElement.alt = name;
  imageCaption.textContent = name;
  openModalWindow(imageModalWindow);
};

const handleProfileFormSubmit = (evt) => {
  evt.preventDefault();
  profileSubmitButton.textContent = profileSubmitButton.dataset.loadingText;
  profileSubmitButton.disabled = true;

  setUserInfo({
    name: profileTitleInput.value,
    about: profileDescriptionInput.value,
  })
    .then((userData) => {
      profileTitle.textContent = userData.name;
      profileDescription.textContent = userData.about;
      closeModalWindow(profileFormModalWindow);
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      profileSubmitButton.textContent = profileSubmitButton.dataset.defaultText;
      profileSubmitButton.disabled = false;
    });
};

const handleAvatarFormSubmit = (evt) => {
  evt.preventDefault();
  avatarSubmitButton.textContent = avatarSubmitButton.dataset.loadingText;
  avatarSubmitButton.disabled = true;

  updateAvatar(avatarInput.value)
    .then((userData) => {
      profileAvatar.style.backgroundImage = `url(${userData.avatar})`;
      closeModalWindow(avatarFormModalWindow);
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      avatarSubmitButton.textContent = avatarSubmitButton.dataset.defaultText;
      avatarSubmitButton.disabled = false;
    });
};

const handleCardFormSubmit = (evt) => {
  evt.preventDefault();
  cardSubmitButton.textContent = cardSubmitButton.dataset.loadingText;
  cardSubmitButton.disabled = true;

  addCard({
    name: cardNameInput.value,
    link: cardLinkInput.value,
  })
    .then((cardData) => {
      placesWrap.prepend(
        createCardElement(
          cardData,
          {
            onPreviewPicture: handlePreviewPicture,
            onLikeIcon: handleLikeCard,
            onDeleteCard: handleDeleteCard,
            onInfoClick: handleInfoClick,
          },
          userId
        )
      );
      closeModalWindow(cardFormModalWindow);
    })
    .catch((err) => {
      console.log(err);
    })
    .finally(() => {
      cardSubmitButton.textContent = cardSubmitButton.dataset.defaultText;
      cardSubmitButton.disabled = false;
    });
};

const handleDeleteCard = (cardId, cardElement) => {
  apiDeleteCard(cardId)
    .then(() => {
      deleteCard(cardElement);
    })
    .catch((err) => {
      console.log(err);
    });
};

const handleLikeCard = (cardId, likeButton, likeCountElement) => {
  const isLiked = likeButton.classList.contains("card__like-button_is-active");

  changeLikeCardStatus(cardId, isLiked)
    .then((updatedCard) => {
      likeCard(likeButton);
      likeCountElement.textContent = updatedCard.likes.length;
    })
    .catch((err) => {
      console.log(err);
    });
};

const formatDate = (date) =>
  date.toLocaleDateString("ru-RU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const createInfoString = (term, description) => {
  const element = document
    .querySelector("#popup-info-definition-template")
    .content.querySelector(".popup__info-item")
    .cloneNode(true);

  element.querySelector(".popup__info-term").textContent = term;
  element.querySelector(".popup__info-description").textContent = description;

  return element;
};

const createUserPreview = (user) => {
  const element = document
    .querySelector("#popup-info-user-preview-template")
    .content.querySelector(".popup__list-item")
    .cloneNode(true);

  element.textContent = user.name;
  return element;
};

const handleInfoClick = (cardId) => {
  getCardList()
    .then((cards) => {
      const cardData = cards.find((card) => card._id === cardId);

      cardInfoTitle.textContent = "Информация о карточке";
      cardInfoList.innerHTML = "";
      cardInfoUsersList.innerHTML = "";

      cardInfoList.append(
        createInfoString("Описание:", cardData.name),
        createInfoString("Дата создания:", formatDate(new Date(cardData.createdAt))),
        createInfoString("Владелец:", cardData.owner.name),
        createInfoString("Количество лайков:", cardData.likes.length)
      );

      cardInfoText.textContent = "Лайкнули:";

      cardData.likes.forEach((user) => {
        cardInfoUsersList.append(createUserPreview(user));
      });

      openModalWindow(cardInfoPopup);
    })
    .catch((err) => {
      console.log(err);
    });
};

profileForm.addEventListener("submit", handleProfileFormSubmit);
cardForm.addEventListener("submit", handleCardFormSubmit);
avatarForm.addEventListener("submit", handleAvatarFormSubmit);

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

const allPopups = document.querySelectorAll(".popup");

allPopups.forEach((popup) => {
  setCloseModalWindowEventListeners(popup);
});

Promise.all([getUserInfo(), getCardList()])
  .then(([userData, cards]) => {
    userId = userData._id;

    profileAvatar.style.backgroundImage = `url(${userData.avatar})`;
    profileTitle.textContent = userData.name;
    profileDescription.textContent = userData.about;

    cards.forEach((cardData) => {
      placesWrap.append(
        createCardElement(
          cardData,
          {
            onPreviewPicture: handlePreviewPicture,
            onLikeIcon: handleLikeCard,
            onDeleteCard: handleDeleteCard,
            onInfoClick: handleInfoClick,
          },
          userId
        )
      );
    });
  })
  .catch((err) => {
    console.log(err);
  });
