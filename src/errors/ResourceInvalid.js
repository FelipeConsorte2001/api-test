module.exports = function ResourceInvalid(message = 'This resource does not belong to that user') {
  this.name = 'ResourceInvalid';
  this.message = message;
};
