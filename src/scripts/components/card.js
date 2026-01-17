export const likeCard = (likeButton) => {
  likeButton.classList.toggle("card__like-button_is-active");
};

export const deleteCard = (cardElement) => {
  cardElement.remove();
};

const getTemplate = () => {
  return document
    .getElementById("card-template")
    .content
    .querySelector(".card")
    .cloneNode(true);
};

export const createCardElement = (
  data,
  { onPreviewPicture, onLikeIcon, onDeleteCard, onInfoClick },
  userId
) => {
  const cardElement = getTemplate();

  const cardImage = cardElement.querySelector(".card__image");
  const cardTitle = cardElement.querySelector(".card__title");
  const likeButton = cardElement.querySelector(".card__like-button");
  const likeCount = cardElement.querySelector(".card__like-count");
  const deleteButton = cardElement.querySelector(".card__control-button_type_delete");
  const infoButton = cardElement.querySelector(".card__control-button_type_info");

  cardImage.src = data.link;
  cardImage.alt = data.name;
  cardTitle.textContent = data.name;
  likeCount.textContent = data.likes.length;

  if (data.owner && data.owner._id !== userId && deleteButton) {
    deleteButton.remove();
  }

  if (onLikeIcon) {
    likeButton.addEventListener("click", () => {
      onLikeIcon(data._id, likeButton, likeCount);
    });
  }

  if (onDeleteCard) {
    deleteButton.addEventListener("click", () => {
      onDeleteCard(data._id, cardElement);
    });
  }

  if (onPreviewPicture) {
    cardImage.addEventListener("click", () => {
      onPreviewPicture({
        name: data.name,
        link: data.link,
      });
    });
  }

  if (onInfoClick) {
    infoButton.addEventListener("click", () => {
      onInfoClick(data._id);
    });
  }

  return cardElement;
};
