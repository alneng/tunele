const NotFound = () => {
  return (
    <div className="font-sf-pro flex justify-center items-center h-screen bg-[#131213] text-center text-white">
      <div className="bg-gray-800 rounded-lg p-24">
        <h1 className="text-3xl font-bold">404 | Page Not Found</h1>
        <p className="text-lg mt-4">
          Looking for{" "}
          <a href="/" className="text-[#1fd660] font-semibold">
            Tunele
          </a>
          ?
        </p>
      </div>
    </div>
  );
};

export default NotFound;
