import React, { useEffect, useState } from "react"
import { useQuery, useMutation } from '@apollo/client';
import gql from 'graphql-tag';


// This query is executed at run time by Apollo.
const GET_TODOS = gql`
{
  to_dos {
        task,
        id,
    }
}
`;
const ADD_TODO = gql`
    mutation addTodo($task: String!){
        addTodo(task: $task){
            task
        }
    }
`
const DEL_TODO = gql`
    mutation delTodo($id: ID!){
        delTodo(id: $id){
            id
        }
    }
`


export default function Home() {
  let [todo, setTodo] = useState<any>()

  const [addTodo] = useMutation(ADD_TODO);
  const [delTodo] = useMutation(DEL_TODO);

  const addTask = (e: any) => {
    e.preventDefault()
    addTodo({
      variables: {
        task: todo
      },
      refetchQueries: [{ query: GET_TODOS }]
    })
    setTodo('')
  }

  const del_task = (e) => {
    console.log(e);
    delTodo({
      variables: {
        id: e
      },
      refetchQueries: [{ query: GET_TODOS }]
    })
  }

  let { loading, error, data } = useQuery(GET_TODOS);

  return (
    <div className="main">
      <div className='topDiv'>
        <h2>Add Task</h2>
        <form onSubmit={addTask}>
          <input type='text' placeholder='Add Text' required value={todo} onChange={(e) => { setTodo(e.target.value) }} />
          <button type='submit'>Add Task</button>
        </form>
      </div>

      <br /> <br />
      <div className='LowerDiv'>
        {loading && <h3>Loading Client Side Querry...</h3>}
        {error && <p>Error: ${error}</p>}
        {data && data.to_dos.length == 0 &&
          <div className="emp">
            <h3>No task to do):</h3>
            <br />
            <p>Note:</p>
            <p>This is a Serverless JAMStack Todo app with Netlify, Gatsby, GraphQL, and FaunaDB</p>
          </div>}
        {data && data.to_dos.map((obj: any) => {
          return (
            <div className='line' key={obj.id}>
              <h3>{obj.task}</h3>
              <button onClick={() => { del_task(obj.id) }}
              >
                <img width='40px' src='https://www.pngall.com/wp-content/uploads/5/Delete-Bin-Trash-PNG-Free-Download.png' />
              </button>
            </div>
          )
        })
        }
      </div>
    </div>
  )
}