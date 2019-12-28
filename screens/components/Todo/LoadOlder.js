import React from 'react';
import { TouchableOpacity, Text } from 'react-native'
import CenterSpinner from '../Util/CenterSpinner';

import gql from 'graphql-tag';
import { withApollo } from 'react-apollo';
import { FETCH_TODOS } from './Todos';


const FETCH_OLD_TODOS = gql`
query ($lastId: Int, $isPublic: Boolean){
  todos (
    order_by: {
      id: desc
    },
   where: {
     _and: {
       is_public: { _eq: $isPublic},
      id: { _lt: $lastId}
     }
   },
   limit: 10
 ) {
   id
   title
   is_completed
   created_at
   is_public
   user {
     name
   }
 }
}
`;

const fetchOlderTodos = async () => {
  const { client } = props;
  const data = client.readQuery({
    query: FETCH_TODOS,
    variables: {
      isPublic,
    }
  });
  const numTodos = data.todos.length;
  setDisabled(true);
  setLoading(true);
  const response = await client.query({
    query: FETCH_OLD_TODOS,
    variables: {
      isPublic,
      lastId: numTodos === 0 ? 0 : data.todos[numTodos - 1].id
    },
  });
  setLoading(false);
  if (!response.data) {
    setDisabled(false)
    return;
  }
  if (response.data.todos) {
    client.writeQuery({
      query: FETCH_TODOS,
      variables: {
        isPublic
      },
      data: { todos: [ ...data.todos, ...response.data.todos]}
    });
    if (response.data.todos.length < 10) {
      setButtonText('No more todos');
      setDisabled(true);
    } else {
      setButtonText('Load more todos');
      setDisabled(false);
    }
  } else {
    setButtonText('Load more todos');
  }
};

const LoadOlderButton = ({ styles }) => {
  const [buttonText, setButtonText] = React.useState('Load some more todos');
  const [loading, setLoading] = React.useState(false);
  const [disabled, setDisabled] = React.useState(false);

  return (
    <TouchableOpacity
      style={styles.pagination}
      onPress={fetchOlderTodos}
      disabled={disabled}
    > 
      {
        loading ?
        <CenterSpinner /> :
        <Text style={styles.buttonText}>
          {buttonText}
        </Text>
      }
    </TouchableOpacity> 
  )
}

export default withApollo(LoadOlderButton);