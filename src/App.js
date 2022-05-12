import logo from './logo.svg';
import './App.css';
// import { create } from 'ipfs-http-client';
import * as ipfsClient from "ipfs-http-client";
import React, {useState, useEffect} from 'react';
import { Buffer } from 'buffer';

const projectId = '292mcpNSrFKS7E6kKTLbxSXK3nO';
const projectSecret = '36803bc3cf862b98f8cbdc6a01e13676';

const auth = 'Basic ' + Buffer.from(projectId + ':' + projectSecret).toString('base64');



const Connect = ({setIpfs}) => {
  const [multiaddr, setMultiaddr] = useState('https://ipfs.infura.io:5001');
  const [error, setError] = useState(null);

  const connect = async (e) => {
    //{ host: "http://127.0.0.1", port: 8080, 'api-path': '/ip4/127.0.0.1/tcp/5001' }
    try {
      // const http = create({ host: "http://127.0.0.1", port: 8080, 'api-path': 'https://ipfs.infura.io:5001/292mcpNSrFKS7E6kKTLbxSXK3nO' })
      const client = ipfsClient.create({
        host: 'ipfs.infura.io',
        port: 5001,
        protocol: 'https',
        apiPath: 'https://ipfs.infura.io:5001',
        headers: {
            authorization: auth,
        },
      });

      // const isOnline = await client.isOnline()

      // if (isOnline) {
      //   console.log(hehe);
      //   setIpfs(client)
      //   setError(null)
      // }
      setIpfs(client);
        console.log('hehe');

    }
    catch(err) {
      console.log('hehe1');

      setError(err.message)
    }
  }

  return (
    <>
      <form onSubmit={(e) => e.preventDefault()}>
        <label htmlFor="connect-input" className="f5 ma0 pb2 aqua fw4 db">Address</label>
        <input
          className="input-reset bn black-80 bg-white pa3 w-100 mb3 ft"
          id="connect-input"
          name="connect-input"
          type="text"
          required
          value={multiaddr}
          onChange={(e) => setMultiaddr(e.target.value)}
        />

        <button
          className="button-reset pv3 tc bn bg-animate bg-black-80 hover-bg-aqua white pointer w-100"
          id="connect-submit"
          type="submit"onClick={connect}>Connect
        </button>
      </form>

      {error && (
        <div className="bg-red pa3 center mv3 white">
          Error: {error.message || error}
        </div>
      )}
    </>
  )
}

const SaveFile = ({ipfs}) => {
  const [isChecked, setIsChecked] = useState(false);
  const [fileHash, setFileHash] = useState(null);
  const [error, setError] = useState(null);

  const captureFile = (event) => {
    event.stopPropagation()
    event.preventDefault()

    isChecked ? saveToIpfsWithFilename(event.target.files) : saveToIpfs(event.target.files)
  }

  // Add file to IPFS and return a CID
  const saveToIpfs = async ([file]) => {
    try {
      const added = await ipfs.add(
        file,
        {
          progress: (prog) => console.log(`received: ${prog}`)
        }
      )

      setFileHash(added.cid.toString())
    } catch (err) {
      setError(err.message)
    }
  }

  // Add file to IPFS and wrap it in a directory to keep the original filename
  const saveToIpfsWithFilename = async ([file]) => {
    const fileDetails = {
      path: file.name,
      content: file
    }

    const options = {
      wrapWithDirectory: true,
      progress: (prog) => console.log(`received: ${prog}`)
    }

    try {
      const added = await ipfs.add(fileDetails, options)

      setFileHash(added.cid.toString())
    } catch (err) {
      setError(err.message)
    }
  }

  const handleSubmit = (event) => {
    event.preventDefault()
  }
  
  return (
    <>
      <form id='capture-media' onSubmit={handleSubmit}>
        <input
          className="input-reset bn black-80 bg-white pa3 w-100 mb3 ft"
          id="input-file"
          name="input-file"
          type="file"
          onChange={captureFile}
        />
        <label htmlFor="input-file" className="f5 ma0 pb2 aqua fw4 db">Input File</label>

        <div className="flex items-center mb2">
          <input className="mr2" type="checkbox" id="keep-filename" name="keep-filename" checked={isChecked}
          onChange={() => setIsChecked(!isChecked)}/>
          <label htmlFor="keep-filename" className="lh-copy">keep filename</label>
        </div>
      </form>

      {fileHash &&
        <div>
          <a id="gateway-link" target='_blank'
            href={'https://ipfs.io/ipfs/' + fileHash}>
            {fileHash}
          </a>
        </div>
      }

      {error && (
        <div className="bg-red pa3 center mv3 white">
          Error: {error.message || error}
        </div>
      )}
    </>
  )
}

const Details = ({keys, obj}) => {
  if (!obj || !keys || keys.length === 0) return null;
  return (
    <>
      {keys?.map((key) => (
        <div className='mb4' key={key}>
          <h2 className='f5 ma0 pb2 aqua fw4'>{key}</h2>
          <div className='bg-white pa2 br2 truncate monospace' data-test={key}>{obj[key]}</div>
        </div>
      ))}
    </>
  )
}

const App = () => {
  const [ipfs, setIpfs] = useState(null);
  const [version, setVersion] = useState(null);
  const [id, setId] = useState(null);

  useEffect(() => {
    if (!ipfs) return;

    const getVersion = async () => {
      const nodeId = await ipfs.version();
      setVersion(nodeId);
    }

    const getId = async () => {
      const nodeId = await ipfs.id();
      setId(nodeId);
    }

    getVersion();
    getId();
  }, [ipfs])

  return (
    <>
      <header className="flex items-center pa3 bg-navy bb bw3 b--aqua">
        <a href="https://ipfs.io" title="home">
          <img
            alt="IPFS logo"
            src={logo}
            style={{'height': '50px'}}
            className="v-top"
          />
        </a>
      </header>

      <main className="pa4-l bg-snow mw7 mv5 center pa4">
        <h1 className="pa0 f2 ma0 mb4 aqua tc">HTTP client upload file</h1>

        <Connect setIpfs={setIpfs}></Connect>
        <br />
        { ipfs &&
          <>
            {(id || version) &&
              <>
                <h1 className='f3 fw4 ma0 pv3 aqua montserrat tc' data-test='title'>Connected to IPFS</h1>
                <div>
                  {id && <Details obj={id} keys={['id', 'agentVersion']}/>}
                  {version && <Details obj={version} keys={['version']}/>}
                </div>
              </>
            }

            <SaveFile ipfs={ipfs}></SaveFile>

          </>
        }
      </main>
    </>
  );
}

export default App;
