import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import Papa from 'papaparse';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHome, faChartLine, faBoxes, faTags,
  faClipboardList, faSignOutAlt, faChevronLeft, faComments, faInfoCircle, faTimes, faEdit, faSave, faFileAlt
} from '@fortawesome/free-solid-svg-icons';
import { faUser as farUser } from '@fortawesome/free-regular-svg-icons';
import './home.css';

const Home = () => {
  const navigate = useNavigate();
  const [selectedOption, setSelectedOption] = useState('Home');
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isAccountDetailsOpen, setIsAccountDetailsOpen] = useState(false);
  const [userDetails, setUserDetails] = useState({});
  const [uploadedFile, setUploadedFile] = useState(null);
  const [fileData, setFileData] = useState([]);
  const [sampleFileData, setSampleFileData] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchUserDetails = async () => {
      const email = localStorage.getItem('userEmail');
      try {
        const response = await fetch(`/api/users/${email}`);
        if (response.ok) {
          const user = await response.json();
          setUserDetails(user);
        }
      } catch (error) {
        console.error('Error fetching user details:', error);
      }
    };

    fetchUserDetails();
  }, []);

  const handleRemoveSampleFile = () => {
    setSampleFileData([]);
  };

  const handleFileUpload = (file) => {
    if (file.type !== 'text/csv') {
      setErrorMessage('Please upload a valid CSV file.');
      return;
    }
    setUploadedFile(file);
    setErrorMessage('');
    const reader = new FileReader();
    reader.onload = (e) => {
      Papa.parse(e.target.result, {
        header: false,
        complete: (result) => {
          setFileData(result.data);
        },
      });
    };
    reader.readAsText(file);
  };

    // Updated loadSampleCSV function to load the correct CSV file based on the selected option
    const loadSampleCSV = () => {
      let csvFilePath = '';
      
      switch (selectedOption) {
        case 'Sales Analysis':
          csvFilePath = '/sample_analysis.csv';
          break;
        case 'Categorical Analysis':
          csvFilePath = '/categorical_analysis.csv';
          break;
        case 'Inventory Analysis':
          csvFilePath = '/inventory_analysis.csv';
          break;
        case 'Product Analysis':
          csvFilePath = '/product_analysis.csv';
          break;
        default:
          csvFilePath = '';
      }
  
      if (csvFilePath) {
        fetch(csvFilePath)
          .then(response => response.text())
          .then(csvText => {
            Papa.parse(csvText, {
              header: false,
              complete: (result) => {
                setSampleFileData(result.data);
              },
            });
          })
          .catch(error => console.error('Error loading sample CSV:', error));
      }
    };

  const { getRootProps, getInputProps } = useDropzone({
    accept: '.csv',
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length) {
        handleFileUpload(acceptedFiles[0]);
      }
    },
  });

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setFileData([]);
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleCellChange = (rowIndex, cellIndex, value) => {
    const updatedData = [...fileData];
    updatedData[rowIndex][cellIndex] = value;
    setFileData(updatedData);
  };

  const handleSaveChanges = () => {
    setIsEditing(false);
    // Optionally, you can handle saving to a server or updating the file here
    console.log('Updated CSV Data:', fileData);
  };

  const renderCSVTable = (data) => {
    if (!data.length) return null;

    return (
      <table className="csv-table">
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <td key={cellIndex}>
                  {isEditing ? (
                    <input
                      type="text"
                      value={cell}
                      onChange={(e) => handleCellChange(rowIndex, cellIndex, e.target.value)}
                    />
                  ) : (
                    cell
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  const renderContent = () => {
    switch (selectedOption) {
      case 'Home':
        return <div>Welcome to the Home page!</div>;
      case 'Chatbot':
        return <div>Chat with our AI chatbot here!</div>;
      case 'Sales Analysis':
      case 'Categorical Analysis':
      case 'Product Analysis':
      case 'Inventory Analysis':
        return (
          <div className="upload-container">
            <div {...getRootProps({ className: 'dropzone' })}>
              <input {...getInputProps()} />
              <button type="button" className="upload-btn">
                <i className="fas fa-upload"></i> Browse Files
              </button>
              <span> Or drag and drop files</span>
            </div>
            {errorMessage && <div className="error-message">{errorMessage}</div>}
            {uploadedFile && (
              <div className="uploaded-file-container">
                <div className="uploaded-file-header">
                  <h3>{uploadedFile.name}</h3>
                  <div className="file-options">
                    <FontAwesomeIcon
                      icon={isEditing ? faSave : faEdit}
                      className="edit-save-icon"
                      onClick={isEditing ? handleSaveChanges : handleEditToggle}
                    />
                    <FontAwesomeIcon
                      icon={faTimes}
                      className="remove-file-icon"
                      onClick={handleRemoveFile}
                    />
                  </div>
                </div>
                {renderCSVTable(fileData)}
              </div>
            )}
            <button className="sample-csv-btn" onClick={loadSampleCSV}>
              <FontAwesomeIcon icon={faFileAlt} /> View Sample CSV
            </button>
            {sampleFileData.length > 0 && (
              <div className="sample-csv-container">
                <div className="sample-file-header">
                   <h3>Sample CSV File</h3>
                   <FontAwesomeIcon
                     icon = {faTimes}
                     className="remove-sample-file-icon"
                     onClick={handleRemoveSampleFile}
                   />
                </div>   
                {renderCSVTable(sampleFileData)}
              </div>
            )}
          </div>
        );
      case 'About Us':
        return <div>Learn more about us here.</div>;
      default:
        return <div>Welcome to the Home page!</div>;
    }
  };

  const renderAccountDetailsForm = () => (
    <div className="account-details">
      <div className="back-button" onClick={() => setIsAccountDetailsOpen(false)}>
        <FontAwesomeIcon icon={faChevronLeft} /> Back
      </div>
      <h3>Account Details</h3>
      <form onSubmit={handleSaveDetails}>
        <label>
          Full Name:
          <input
            type="text"
            name="name"
            value={userDetails.name || ''}
            onChange={handleInputChange}
            required
          />
        </label>
        <label>
          Phone Number:
          <input
            type="tel"
            name="phone"
            value={userDetails.phone || ''}
            onChange={handleInputChange}
          />
        </label>
        <label>
          Email Address:
          <input
            type="email"
            name="email"
            value={userDetails.email || ''}
            onChange={handleInputChange}
            required
          />
        </label>
        <label>
          Shop Name:
          <input
            type="text"
            name="shopName"
            value={userDetails.shopName || ''}
            onChange={handleInputChange}
            required
          />
        </label>
        <label>
          Shop Address:
          <input
            type="text"
            name="address"
            value={userDetails.address || ''}
            onChange={handleInputChange}
          />
        </label>
        <div className="form-actions">
          <button type="button" className="cancel-btn" onClick={() => setIsAccountDetailsOpen(false)}>
            Cancel
          </button>
          <button type="submit">Update</button>
        </div>
      </form>
    </div>
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserDetails({ ...userDetails, [name]: value });
  };

  const handleSaveDetails = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/account-details', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userDetails),
      });
      if (response.ok) {
        const updatedUser = await response.json();
        setUserDetails(updatedUser);
        setIsAccountDetailsOpen(false);
      } else {
        console.error('Error saving account details');
      }
    } catch (error) {
      console.error('Error saving account details:', error);
    }
  };

  const toggleProfileMenu = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userEmail');
    navigate('/');
  };

  return (
    <div className="home">
      <div className="sidebar">
        <h2>Sales-AI-Analyst</h2>
        <ul>
          <li onClick={() => setSelectedOption('Home')}>
            <FontAwesomeIcon icon={faHome} /> Home
          </li>
          <li onClick={() => setSelectedOption('Chatbot')}>
            <FontAwesomeIcon icon={faComments} /> Chatbot
          </li>
          <li onClick={() => setSelectedOption('Sales Analysis')}>
            <FontAwesomeIcon icon={faChartLine} /> Sales Analysis
          </li>
          <li onClick={() => setSelectedOption('Categorical Analysis')}>
            <FontAwesomeIcon icon={faTags} /> Categorical Analysis
          </li>
          <li onClick={() => setSelectedOption('Inventory Analysis')}>
            <FontAwesomeIcon icon={faBoxes} /> Inventory Analysis
          </li>
          <li onClick={() => setSelectedOption('Product Analysis')}>
            <FontAwesomeIcon icon={faClipboardList} /> Product Analysis
          </li>
          <li onClick={() => setSelectedOption('About Us')}>
            <FontAwesomeIcon icon={faInfoCircle} /> About Us
          </li>
        </ul>
      </div>
      <div className="main-content">
        <div className="header">
          <h1>{selectedOption}</h1>
        </div>
        {renderContent()}
      </div>
      <div className="extra-content">
        <div className="profile-icon" onClick={toggleProfileMenu}>
          <FontAwesomeIcon icon={farUser} />
        </div>
        {isProfileMenuOpen && (
          <div className="profile-menu">
            <div className="user-name">Hi! {userDetails.name}</div>
            
            <div
              className="manage-account-btn"
              onClick={() => {
                setIsAccountDetailsOpen(true);
                setIsProfileMenuOpen(false);
              }}
            >
              Manage Account
            </div>
            <div className="profile-options">
              <div className="option" onClick={handleLogout}>
                <FontAwesomeIcon icon={faSignOutAlt} /> Logout
              </div>
            </div>
          </div>
        )}
        {isAccountDetailsOpen && renderAccountDetailsForm()}
      </div>
    </div>
  );
};

export default Home;
