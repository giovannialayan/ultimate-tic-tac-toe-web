const secondsToMinutes = (seconds) => {
  return new Date(seconds * 1000).toISOString().substr(14, 5);
};

const forceMultiple = (original, multiple) => {
  return original - (original % multiple);
};

function loadJsonFetch(callback) {
  const fetchPromise = async () => {
    let response = await fetch('data/bots.json');

    if (!response.ok) {
      throw new Error(`http error. status: ${response.status}`);
    }

    callback(await response.json());
  };

  fetchPromise().catch((e) => {
    console.log(`in catch with e = ${e}`);
  });
}

export { secondsToMinutes, forceMultiple, loadJsonFetch };
