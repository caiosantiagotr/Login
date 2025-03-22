import { useEffect, useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList } from 'react-native';
import { db, auth } from './FirebaseConnection'
import { doc, getDoc, onSnapshot, setDoc, collection, addDoc, getDocs, updateDoc } from 'firebase/firestore'
import { UsersList } from './users'

import { signOut } from 'firebase/auth'

export function FormUsers() {
  const [nome, setNome] = useState("")
  const [idade, setIdade] = useState("")
  const [cargo, setCargo] = useState("")
  const [cep, setCep] = useState("")
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(true);
  const [isEditing, setIsEditing] = useState("");

  useEffect(() => {
    async function getDados(){
      const usersRef = collection(db, "users");
      onSnapshot(usersRef, (snapshot) => {
        let lista = [];
        snapshot.forEach((doc) => {
          lista.push({
            id: doc.id,
            nome: doc.data().nome,
            idade: doc.data().idade,
            cargo: doc.data().cargo,
            cep: doc.data().cep,
          })
        })
        setUsers(lista);
      })
    }
    getDados();
  }, [])

  async function handleRegister(){
    await addDoc(collection(db, "users"), {
      nome: nome,
      idade: idade,
      cargo: cargo,
      cep: cep,
    })
    .then(() => {
      console.log("CADASTRADO COM SUCESSO")
      setNome("")
      setIdade("")
      setCargo("")
      setCep("")
    })
    .catch((err) => {
      console.log(err)
    })
  }

  function handleToggle(){
    setShowForm(!showForm);
  }

  function editUser(data){
    setNome(data.nome)
    setIdade(data.idade)
    setCargo(data.cargo)
    setCep(data.cep)
    setIsEditing(data.id);
  }

  async function handleEditUser(){
    const docRef = doc(db, "users", isEditing)
    await updateDoc(docRef, {
      nome: nome,
      idade: idade,
      cargo: cargo,
      cep: cep,
    })
    setNome("")
    setCargo("")
    setIdade("")
    setCep("")
    setIsEditing("");
  }

  async function handleLogout(){
    await signOut(auth);
  } 

  return (
    <View style={styles.container}>
      { showForm && (
        <View style={styles.formContainer}>
          <Text style={styles.label}>Nome:</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite seu nome..."
            value={nome}
            onChangeText={ (text) => setNome(text) } 
          />
          <Text style={styles.label}>Idade:</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite sua idade..."
            value={idade}
            onChangeText={ (text) => setIdade(text) } 
          />
          <Text style={styles.label}>Cargo:</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite o seu cargo..."
            value={cargo}
            onChangeText={ (text) => setCargo(text) } 
          />
          <Text style={styles.label}>CEP:</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite seu CEP..."
            value={cep}
            onChangeText={ (text) => setCep(text) } 
          />
          {isEditing !== "" ? (
            <TouchableOpacity style={styles.button} onPress={handleEditUser}>
              <Text style={styles.buttonText}>Editar usuário</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.button} onPress={handleRegister}>
              <Text style={styles.buttonText}>Adicionar</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
      <TouchableOpacity onPress={handleToggle} style={styles.toggleButton}>
        <Text style={styles.toggleButtonText}>
          {showForm ? "Esconder formulário" : "Mostrar formulário"}
        </Text>
      </TouchableOpacity>
      <Text style={styles.title}>Usuários:</Text>
      <FlatList
        style={styles.list}
        data={users}
        keyExtractor={ (item) => String(item.id) }
        renderItem={ ({ item }) => <UsersList data={item} handleEdit={ (item) => editUser(item) } /> }
      />
      <TouchableOpacity onPress={handleLogout} style={styles.buttonLogout}>
        <Text style={styles.buttonText}>Sair da conta</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f0f0f0"
  },
  button: {
    backgroundColor: "#3498db",
    marginVertical: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: "center"
  },
  buttonText: {
    padding: 8,
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: 'center'
  },
  label: {
    color: "#000",
    fontSize: 18,
    marginBottom: 8,
    marginLeft: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#fff",
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginHorizontal: 8,
    marginBottom: 10,
    fontSize: 16
  },
  list: {
    marginTop: 20,
    marginHorizontal: 8,
  },
  buttonLogout: {
    backgroundColor: 'red',
    alignSelf: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 20
  }
});
