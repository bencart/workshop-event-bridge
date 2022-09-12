/* eslint-disable */
// this is an auto generated file. This will be overwritten

exports.createMessage = /* GraphQL */ `
  mutation CreateMessage(
    $input: CreateMessageInput!
    $condition: ModelMessageConditionInput
  ) {
    createMessage(input: $input, condition: $condition) {
      id
      evnt
      name
      emoji
      food
      colour
      animal
      createdAt
      updatedAt
    }
  }
`;
