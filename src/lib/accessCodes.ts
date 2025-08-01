import { 
  collection, 
  doc, 
  getDoc, 
  updateDoc, 
  query, 
  where, 
  getDocs,
  addDoc,
  deleteDoc 
} from 'firebase/firestore';
import { db } from './firebase';

export interface AccessCode {
  id: string;
  code: string;
  isUsed: boolean;
  usedBy?: string; // UID do usuário que usou
  usedAt?: string; // Data de uso
  createdAt: string;
  createdBy: string; // Admin que criou
  description?: string; // Ex: "Aluno João Silva"
  // Informações do usuário que usou o código
  userInfo?: {
    name: string;
    email: string;
  };
}

// Gerar código único de 8 caracteres
export const generateUniqueCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Verificar se código existe e está disponível
export const validateAccessCode = async (code: string): Promise<{ valid: boolean; message: string }> => {
  try {
    const codesRef = collection(db, 'access_codes');
    const q = query(codesRef, where('code', '==', code.toUpperCase()));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return { valid: false, message: 'Código de acesso inválido.' };
    }

    const codeDoc = querySnapshot.docs[0];
    const codeData = codeDoc.data() as AccessCode;

    if (codeData.isUsed) {
      return { valid: false, message: 'Este código já foi utilizado.' };
    }

    return { valid: true, message: 'Código válido!' };
  } catch (error) {
    console.error('Erro ao validar código:', error);
    return { valid: false, message: 'Erro ao validar código. Tente novamente.' };
  }
};

// Marcar código como usado
export const useAccessCode = async (code: string, userId: string): Promise<boolean> => {
  try {
    console.log('Marcando código como usado:', code, 'para usuário:', userId);
    
    const codesRef = collection(db, 'access_codes');
    const q = query(codesRef, where('code', '==', code.toUpperCase()));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const codeDoc = querySnapshot.docs[0];
      console.log('Código encontrado, atualizando...');
      
      await updateDoc(codeDoc.ref, {
        isUsed: true,
        usedBy: userId,
        usedAt: new Date().toISOString()
      });
      
      console.log('Código marcado como usado com sucesso');
      return true;
    }
    
    console.log('Código não encontrado');
    return false;
  } catch (error) {
    console.error('Erro ao marcar código como usado:', error);
    return false;
  }
};

// Criar novo código de acesso (apenas admins)
export const createAccessCode = async (description?: string, createdBy: string = 'admin'): Promise<string> => {
  try {
    let code = generateUniqueCode();
    
    // Verificar se o código já existe (muito improvável, mas por segurança)
    let codeExists = true;
    while (codeExists) {
      const codesRef = collection(db, 'access_codes');
      const q = query(codesRef, where('code', '==', code));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        codeExists = false;
      } else {
        code = generateUniqueCode();
      }
    }

    const newCode: Omit<AccessCode, 'id'> = {
      code,
      isUsed: false,
      createdAt: new Date().toISOString(),
      createdBy,
      description
    };

    const docRef = await addDoc(collection(db, 'access_codes'), newCode);
    return code;
  } catch (error) {
    console.error('Erro ao criar código:', error);
    throw error;
  }
};

// Listar todos os códigos com informações dos usuários (apenas admins)
export const getAllAccessCodes = async (): Promise<AccessCode[]> => {
  try {
    const codesRef = collection(db, 'access_codes');
    const querySnapshot = await getDocs(codesRef);
    
    const codes = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as AccessCode));

    console.log('Códigos encontrados:', codes.length);
    console.log('Códigos usados:', codes.filter(c => c.isUsed).length);

    // Buscar informações dos usuários para códigos usados
    const codesWithUserInfo = await Promise.all(
      codes.map(async (code) => {
        if (code.isUsed && code.usedBy) {
          console.log('Buscando dados do usuário:', code.usedBy, 'para código:', code.code);
          try {
            const userDoc = await getDoc(doc(db, 'users', code.usedBy));
            console.log('Documento do usuário existe:', userDoc.exists());
            
            if (userDoc.exists()) {
              const userData = userDoc.data();
              console.log('Dados completos do usuário:', userData);
              
              // Verificar se o usuário foi excluído
              if (userData.isDeleted) {
                console.log('Usuário foi excluído:', code.usedBy);
                code.userInfo = {
                  name: 'Usuário Excluído',
                  email: 'Email não disponível'
                };
              } else {
                // Verificar todos os campos possíveis
                const userName = userData.name || userData.nome || userData.displayName || 'Nome não informado';
                const userEmail = userData.email || userData.emailAddress || 'Email não informado';
                
                console.log('Nome extraído:', userName);
                console.log('Email extraído:', userEmail);
                
                code.userInfo = {
                  name: userName,
                  email: userEmail
                };
                console.log('Informações do usuário definidas:', code.userInfo);
              }
            } else {
              console.log('Documento do usuário não encontrado para UID:', code.usedBy);
              code.userInfo = {
                name: 'Usuário não encontrado',
                email: 'Email não encontrado'
              };
            }
          } catch (error) {
            console.error('Erro ao buscar dados do usuário:', error);
            code.userInfo = {
              name: 'Erro ao buscar usuário',
              email: 'Erro ao buscar email'
            };
          }
        }
        return code;
      })
    );

    console.log('Códigos com informações de usuário processados:', codesWithUserInfo.length);
    return codesWithUserInfo;
  } catch (error) {
    console.error('Erro ao buscar códigos:', error);
    return [];
  }
};

// Deletar código (apenas admins)
export const deleteAccessCode = async (codeId: string): Promise<boolean> => {
  try {
    await deleteDoc(doc(db, 'access_codes', codeId));
    return true;
  } catch (error) {
    console.error('Erro ao deletar código:', error);
    return false;
  }
};

// Excluir usuário do sistema (apenas admins)
export const deleteUser = async (userId: string): Promise<boolean> => {
  try {
    console.log('Tentando excluir usuário:', userId);
    
    // Verificar se o usuário existe antes de deletar
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) {
      console.log('Usuário não encontrado para exclusão:', userId);
      return false;
    }
    
    console.log('Usuário encontrado, dados:', userDoc.data());
    
    // Em vez de deletar, marcar o usuário como excluído
    await updateDoc(doc(db, 'users', userId), {
      isDeleted: true,
      deletedAt: new Date().toISOString(),
      deletedBy: 'admin' // Você pode passar o UID do admin aqui se necessário
    });
    
    console.log('Usuário marcado como excluído no Firestore:', userId);
    
    // Marcar o código como não usado novamente
    const codesRef = collection(db, 'access_codes');
    const q = query(codesRef, where('usedBy', '==', userId));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const codeDoc = querySnapshot.docs[0];
      console.log('Marcando código como disponível novamente:', codeDoc.data().code);
      
      await updateDoc(codeDoc.ref, {
        isUsed: false,
        usedBy: null,
        usedAt: null
      });
      
      console.log('Código marcado como disponível novamente');
    }
    
    console.log('Usuário excluído com sucesso do sistema');
    return true;
  } catch (error) {
    console.error('Erro ao deletar usuário:', error);
    return false;
  }
};

// Função de teste para verificar dados no Firestore
export const debugFirestoreData = async () => {
  try {
    console.log('=== DEBUG FIRESTORE DATA ===');
    
    // Verificar códigos de acesso
    const codesRef = collection(db, 'access_codes');
    const codesSnapshot = await getDocs(codesRef);
    console.log('Total de códigos:', codesSnapshot.size);
    
    codesSnapshot.forEach((doc) => {
      const data = doc.data();
      console.log('Código:', data.code, '| Usado:', data.isUsed, '| UsedBy:', data.usedBy);
    });
    
    // Verificar usuários
    const usersRef = collection(db, 'users');
    const usersSnapshot = await getDocs(usersRef);
    console.log('Total de usuários:', usersSnapshot.size);
    
    usersSnapshot.forEach((doc) => {
      const data = doc.data();
      console.log('Usuário ID:', doc.id, '| Nome:', data.name, '| Email:', data.email);
    });
    
    console.log('=== FIM DEBUG ===');
  } catch (error) {
    console.error('Erro no debug:', error);
  }
};