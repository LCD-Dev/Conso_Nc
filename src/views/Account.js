import { auth, ui, uiConfig } from '../firebaseConfig';
import { getRedirectResult, signInWithEmailAndPassword, updateProfile, updatePassword } from "firebase/auth";

let isUpdateFormVisible = false;

const toggleUpdateForm = () => {
  isUpdateFormVisible = !isUpdateFormVisible;
  handleAuthStateChange();
};

const renderUserInfo = (user) => `
  <div id="user-info">
    <p>Bienvenue, ${user.displayName || user.email}</p>
    <p><strong>Email vérifié:</strong> ${user.emailVerified ? 'Oui' : 'Non'}</p>
    <button id="update-profile-button">Mettre à jour son profil</button>
    ${isUpdateFormVisible ? `
      <form id="update-profile-form">
        <input type="text" id="new-display-name" placeholder="Nouveau nom" value="${user.displayName || ''}" />
        <input type="password" id="new-password" placeholder="Nouveau mot de passe" />
        <button type="submit">Enregistrer</button>
      </form>
    ` : ''}
    <button id="logout-button">Déconnexion</button>
  </div>
`;

const renderAuthUI = () => `
  <div id="account-container">
    <div id="firebaseui-auth-container"></div>
    <p id="already-have-account">
      Déjà un compte ? <a href="#" id="login-link">Se connecter</a>
    </p>
  </div>
`;

const renderAccountPage = (user) => `
  <div id="account">
    <h2>${user ? 'Compte' : 'Connexion'}</h2>
    ${user ? renderUserInfo(user) : renderAuthUI()}
  </div>
`;

const attachEventListeners = () => {
  const logoutButton = document.getElementById('logout-button');
  const updateProfileButton = document.getElementById('update-profile-button');
  const updateProfileForm = document.getElementById('update-profile-form');
  const loginLink = document.getElementById('login-link');

  if (logoutButton) {
    logoutButton.addEventListener('click', () => {
      auth.signOut().then(() => {
        alert('Déconnexion réussie');
        window.location.hash = 'home';  // Rediriger vers la page d'accueil après déconnexion
        handleAuthStateChange();  // Re-rendre l'interface après déconnexion
      }).catch((error) => {
        console.error('Erreur de déconnexion:', error);
      });
    });
  }

  if (updateProfileButton) {
    updateProfileButton.addEventListener('click', toggleUpdateForm);
  }

  if (updateProfileForm) {
    updateProfileForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const newDisplayName = document.getElementById('new-display-name').value;
      const newPassword = document.getElementById('new-password').value;
      const user = auth.currentUser;

      if (newDisplayName && user) {
        updateProfile(user, { displayName: newDisplayName }).then(() => {
          alert('Nom mis à jour');
          handleAuthStateChange();
        }).catch((error) => {
          console.error('Erreur de mise à jour du nom:', error);
        });
      }

      if (newPassword && user) {
        updatePassword(user, newPassword).then(() => {
          alert('Mot de passe mis à jour');
        }).catch((error) => {
          console.error('Erreur de mise à jour du mot de passe:', error);
        });
      }
    });
  }

  if (loginLink) {
    loginLink.addEventListener('click', (e) => {
      e.preventDefault();
      ui.start('#firebaseui-auth-container', uiConfig);
    });
  }
};

const handleAuthStateChange = () => {
  auth.onAuthStateChanged((user) => {
    if (user) {
      // Si l'utilisateur est connecté, afficher la page de compte
      window.location.hash = 'account';
    }

    if (window.location.hash.substring(1) === 'account') {
      document.getElementById('content').innerHTML = renderAccountPage(user);
      attachEventListeners();
      if (!user) {
        ui.start('#firebaseui-auth-container', uiConfig);
      }
    }
  });
};

document.addEventListener('DOMContentLoaded', () => {
  getRedirectResult(auth)
    .then((result) => {
      if (result && result.user) {
        console.log('Utilisateur connecté après redirection:', result.user);
        handleAuthStateChange(); // Re-rendre l'interface avec l'utilisateur connecté
      }
    })
    .catch((error) => {
      console.error('Erreur de connexion:', error);
    });

  handleAuthStateChange(); // Appel initial pour gérer l'état d'authentification actuel
});

export default handleAuthStateChange;
