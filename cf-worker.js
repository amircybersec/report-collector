/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run "npm run dev" in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run "npm run deploy" to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  if (request.method === 'POST') {
    const clientIP = request.headers.get('CF-Connecting-IP')
    const cloudflareIP = request.cf?.destinationIPAddress
    const clientASN = request.cf?.asn
    const clientCountry = request.cf?.country
    const clientAsOrg = request.cf?.asOrganization
    const jsonData = await request.json()

    // Append the client IP and ASN to the JSON data
    jsonData.clientIP = clientIP
    jsonData.clientASN = clientASN
    jsonData.clientCountry = clientCountry
    jsonData.clientAsOrg = clientAsOrg

    // Get the geolocation endpoint from the query parameters
    const url = new URL(request.url)
    const geolocationEndpoint = url.searchParams.get('geolocation_endpoint') || 'ooni'

    // Define the ipinfo.io token
    const ipinfoToken = 'xxxxxxxxxx'

    // Iterate over each attempt and make a POST request for each IP address
    const geolookupPromises = jsonData.result.attempts.map(async attempt => {
      const ipAddress = attempt.address.host
      let geolookupData

      if (geolocationEndpoint === 'ooni') {
        const geolookupResponse = await fetch('https://api.dev.ooni.io/api/v1/geolookup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ addresses: [ipAddress] })
        })

      const geolookupData = await geolookupResponse.json()
      const { as_name, asn, cc } = geolookupData.geolocation[ipAddress]

      // Inject the geolocation data into the attempt object
      attempt.address.as_name = as_name
      attempt.address.asn = asn
      attempt.address.cc = cc
    } else if (geolocationEndpoint === 'ipinfo') {
      const geolookupResponse = await fetch(`https://ipinfo.io/${ipAddress}`, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${ipinfoToken}`
        }
      })

      geolookupData = await geolookupResponse.json()
      const { org, country } = geolookupData

      // Extract the ASN and as_name from the org field
      const [asnWithPrefix, ...asNameParts] = org.split(' ')
      const asn = asnWithPrefix.replace('AS', '')
      const as_name = asNameParts.join(' ')

      // Inject the geolocation data into the attempt object
      attempt.address.as_name = as_name
      attempt.address.asn = asn
      attempt.address.cc = country
    }
  })

    // Wait for all geolookup promises to resolve
    await Promise.all(geolookupPromises)

    // Relay the modified JSON data to another endpoint
    const relayEndpoint = 'https://script.google.com/macros/s/xxxxxxxx/exec'
    const response = await fetch(relayEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(jsonData)
    })

    // Return the response from the relay endpoint
    return response
  } else {
    return new Response('Method not allowed', { status: 405 })
  }
}
