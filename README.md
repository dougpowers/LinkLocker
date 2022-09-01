[![LinkedIn][linkedin-shield]][linkedin-url]



<!-- PROJECT HEADER -->
<br />
<div align="center">
<h3 align="center">LinkLocker</h3>

  <p align="center">
    An encrypted bookmark manager written in React using TypeScript. 
    <br />
    <br />
    <br />
    ·
    <a href="https://github.com/github_username/repo_name/issues">Report Bug</a>
    ·
    <a href="https://github.com/github_username/repo_name/issues">Request Feature</a>
  </p>
</div>



<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
  </ol>
</details>



<!-- ABOUT THE PROJECT -->
## About The Project

LinkLocker is a basic bookmark management addon written in React using TypeScript. It uses the argon2 algorithm to authenticate via usernames and passwords and to generate a key for its AES-256 encryption.

LinkLocker is intended to be used in incognito mode. When used in non-incognito mode, LinkLocker sessions may persist through browser shutdown. If you use LinkLocker in non-incognito mode, be sure to log out of your session before closing your browser to maintain privacy. Adding links in both modes simultaneously is not recommended and may result in lost entries.

<p align="right">(<a href="#readme-top">back to top</a>)</p>



### Built With

* [![React][React.js]][React-url]

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- GETTING STARTED -->
## Getting Started

To get a local copy up and running follow these steps.

### Prerequisites

LinkLocker is built using node. Install node before building LinkLocker.
* npm
  ```sh
  npm install npm@latest -g
  ```

### Installation

1. Clone the repo
   ```sh
   git clone https://github.com/github_username/repo_name.git
   ```
2. Install NPM packages
   ```sh
   npm install
   ```

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- ROADMAP -->
## Roadmap

- [ ] Add search bar to link view
- [ ] Add keyword capability to links

See the [open issues](https://github.com/dougpowers/LinkLocker/issues) for a full list of proposed features (and known issues).

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- LICENSE -->
## License

Distributed under the MIT License. See `LICENSE` for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- CONTACT -->
## Contact

Doug Powers - dougpowers@gmail.com - [LinkedIn](https://www.linkedin.com/in/douglas-powers-537380104)

Project Link: [https://github.com/dougpowers/LinkLocker](https://github.com/dougpowers/LinkLocker)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://www.linkedin.com/in/douglas-powers-537380104
[product-screenshot]: images/screenshot.png
[React.js]: https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[React-url]: https://reactjs.org/
