/**
 * Use Google GeoCode API to obtain the coordinate of an address
 *
 * Current assumptions:
 *
 * - we use project address to center the map. If the project address
 *   is undefined, use the instance's address. And if the instance
 *   address is undefined, use OneCrew HQ address.
 * - npm pkg "react-places-autocomplete" seems like a good solution if
 *   we need to provide a address search box (but the pkg is outdated)
 * - current implementation is a hack: just fetch the first result
 *   from the api
 * - Google Geocode API detail page including status code
 *   https://developers.google.com/maps/documentation/geocoding/requests-geocoding#StatusCodes
 */

export const getLngLat = async ({ address, country = "US" }, apiKey) => {
  const result = await (
    await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?key=${apiKey}&address=${encodeURIComponent(
        address
      )}&region=${country}`
    )
  ).json();

  if (result.status === "OK" && result.results && result.results.length > 0) {
    return {
      formattedAddress: result.results[0].formatted_address,
      coordinate: result.results[0].geometry.location,
    };
  } else {
    throw new Error(
      `unable to obtain lng/lat for address: ${address}, status: ${result.status}`
    );
  }
};
