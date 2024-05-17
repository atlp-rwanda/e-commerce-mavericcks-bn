export const extractImageId = (url: string) => {
  const regex = /\/([a-zA-Z0-9]+)\.[a-z]+$/;
  const match = url.match(regex);

  if (match && match[1]) {
    return match[1];
  } else {
    return null;
  }
};
