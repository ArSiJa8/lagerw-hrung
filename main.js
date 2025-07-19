const SUPABASE_URL = 'https://ouhbmxuocjmyjuvisqjq.supabase.co'; // deine URL hier rein
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im91aGJteHVvY2pteWp1dmlzcWpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5Mzk4NTIsImV4cCI6MjA2ODUxNTg1Mn0.adlY_BWlONNPmA2nOF2y_vWeLvW58xc4rwG3Q1Fe2mQ'; // deinen Key hier rein

const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const authStatus = document.getElementById('auth-status');
const userInfo = document.getElementById('user-info');
const authDiv = document.getElementById('auth');
const usernameSpan = document.getElementById('username');
const pointsSpan = document.getElementById('points');
const messageP = document.getElementById('message');

async function signUp() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const { user, error } = await supabase.auth.signUp({ email, password });
  if (error) {
    authStatus.textContent = 'Fehler: ' + error.message;
  } else {
    authStatus.textContent = 'Registrierung erfolgreich! Bitte bestätige deine E-Mail.';
  }
}

async function signIn() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    authStatus.textContent = 'Fehler: ' + error.message;
  } else {
    authStatus.textContent = 'Erfolgreich eingeloggt!';
    showUserInfo();
  }
}

async function showUserInfo() {
  const user = supabase.auth.getUser();
  const userData = (await user).data.user;
  if (!userData) {
    authDiv.style.display = 'block';
    userInfo.style.display = 'none';
    return;
  }
  authDiv.style.display = 'none';
  userInfo.style.display = 'block';

  // Username = E-Mail (wegen Trigger)
  usernameSpan.textContent = userData.email;

  // Punkte aus Tabelle laden
  const { data, error } = await supabase
    .from('profiles')
    .select('points')
    .eq('id', userData.id)
    .single();

  if (error) {
    pointsSpan.textContent = 'Fehler beim Laden';
  } else {
    pointsSpan.textContent = data.points;
  }
}

async function sendPoints() {
  const user = (await supabase.auth.getUser()).data.user;
  const receiver = document.getElementById('receiver').value;
  const amount = parseInt(document.getElementById('amount').value, 10);

  if (!receiver || !amount || amount <= 0) {
    messageP.textContent = 'Bitte Empfänger und gültige Punktzahl eingeben.';
    return;
  }

  const { error } = await supabase.rpc('transfer_points', {
    sender: user.id,
    receiver_username: receiver,
    amount: amount,
  });

  if (error) {
    messageP.textContent = 'Fehler: ' + error.message;
  } else {
    messageP.textContent = 'Punkte erfolgreich gesendet!';
    showUserInfo(); // Punkte neu laden
  }
}

async function signOut() {
  await supabase.auth.signOut();
  authDiv.style.display = 'block';
  userInfo.style.display = 'none';
  authStatus.textContent = 'Ausgeloggt.';
}

// Beim Laden prüfen, ob User angemeldet ist
supabase.auth.onAuthStateChange((_event, session) => {
  if (session?.user) {
    showUserInfo();
  } else {
    authDiv.style.display = 'block';
    userInfo.style.display = 'none';
  }
});

