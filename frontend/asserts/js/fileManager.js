async function uploadFile(file) {
    const fileInput = document.getElementById('fileInput');
    if (file == undefined)
        file = fileInput.files[0];
    const key = prompt("Please enter your file name:");

    if (!file || !key) {
        alert("Please select a file and enter a file name.");
        return;
    }

    async function uploadUrl(key) {
        const token = localStorage.getItem('authToken');
        if (!token) {
            localStorage.setItem("isAuthenticated", false);
            alert('No token found. Please log in.');
            return;
        }
        try {
            const response = await axios.post('http://localhost:3000/presigneduploadurl', { key }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.data.onetimeurl;
        } catch (error) {
            if (error.response && error.response.data.message === 'Invalid token') {
                localStorage.setItem("isAuthenticated", false);
                console.error('Invalid Token or Token expired !');
            } else {
                console.error('Error fetching data', error);
                alert("Failed to get the pre-signed URL.");
            }
        }
    }

    try {
        const url = await uploadUrl(key);
        if (!url) {
            return;
        }

        const uploadResponse = fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': new Blob([file]).size
            },
            body: file
        }).then(res => {
            console.log(res.ok);
            if (res.ok) {
                alert("File uploaded successfully!");
            } else {
                alert("File upload failed.");
            }
        }).catch(err => console.error(err));

    } catch (error) {
        console.error('Error uploading file', error);
        alert("An error occurred during file upload.");
    }
}

// Function to log in and store the token
async function login() {
    const response = await axios.post('http://localhost:3000/signin', {
        username: 'vishal',
        password: 'Hello@123'
    });
    const token = response.data.token;
    localStorage.setItem('authToken', token);
    alert('Logged in successfully');
}
async function fetchFileList() {
    const token = localStorage.getItem('authToken');
    if (!token) {
        localStorage.setItem("isAuthenticated", false);
        alert('No token found. Please log in.');
        window.location.href = 'index.html';
        return;
    }
    try {
        const response = await axios.post('http://localhost:3000/listfiles',{username:"vishal"}, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (response.data.success) {
            const fileList = response.data.files;
            displayFileList(fileList);
        } else {
            console.error("Error list files");
        }
    } catch (error) {
        console.error('Error fetching file list', error);
        if (error.response.data.message === 'token') {
            try {
                localStorage.setItem("isAuthenticated", false);
                localStorage.removeItem('authToken');
                window.location.href = 'index.html';
            } catch (err) {
                console.err(err);
            }
        }
        alert("Failed to fetch the file list.");
    }
}

function displayFileList(files) {
    const fileListContainer = document.getElementById('filesList');
    fileListContainer.innerHTML = '<h3>Uploaded Files</h3>';
    const fileList = document.createElement('ul');
    files.forEach(file => {
        const listItem = document.createElement('li');
        const link = document.createElement('a');
        link.appendChild(document.createTextNode(file.key));
        link.href = file.url;
        listItem.appendChild(link);
        fileList.appendChild(listItem);
    });
    fileListContainer.appendChild(fileList);
}

function signOut() {
    localStorage.removeItem('authToken');
    localStorage.setItem("isAuthenticated", false);
    window.location.href = 'index.html';
    alert('Sign Out Successfull!')
}

function dropHandler(event) {
    event.preventDefault();
    const files = event.dataTransfer.files;
    uploadFile(files);
}

function dragOverHandler(event) {
    event.preventDefault();
}
function fileinputClicked() {
    console.log("file input clicked!")
}
document.getElementById('signOutBtn').addEventListener('click', signOut);
document.getElementById('upload').addEventListener('click', () => uploadFile(undefined));
document.getElementById('refresh').addEventListener('click', fetchFileList);

fetchFileList();
