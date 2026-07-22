import React, { Suspense } from "react";
import ViewGalleryPage from "./ViewGalleryPage";

const page = () => {
  return (
    <div>
      <Suspense fallback={<div></div>}>
        {" "}
        <ViewGalleryPage />
      </Suspense>
    </div>
  );
};

export default page;
