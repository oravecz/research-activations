import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';

const events = [
  {
    id: 1,
    brand: "Burberry",
    title: "Twas The Knight Before Holiday Campaign & Pop-Ups",
    date: "November 2025",
    location: "London (Claridge's), New York (Bloomingdale's)",
    description: "Burberry's 2025 holiday campaign directed by John Madden stars Jennifer Saunders, Naomi Campbell, Ncuti Gatwa, Rosie Huntington-Whiteley, and Son Heung-min. The campaign features festive gatherings in a London townhouse showcasing new season outerwear including the Heath Quilted Cape, Trerose Trench Coat, and Harrogate Duffle Coat.",
    activation: "Pop-up at Claridge's featuring a Scarf Bar and festive gifting edit, plus a custom-designed Christmas tree by Daniel Lee. At Bloomingdale's 59th Street, a cottage-inspired pop-up with curated gifts, and the building façade wrapped in an oversized Burberry Check scarf during the lighting ceremony.",
    url: "https://wwd.com/fashion-news/fashion-features/burberry-jennifer-saunders-naomi-campbell-christmas-ad-film-1238334044/",
    category: "Holiday Campaign"
  },
  {
    id: 2,
    brand: "Gap x Sandy Liang",
    title: "Sandy's Dream Closet Collaboration",
    date: "October 10, 2025",
    location: "Global Launch - Gap.com & Select Stores",
    description: "Gap partnered with New York-based designer Sandy Liang for a limited-edition collection reimagining Gap's iconic denim, fleece, and outerwear through Liang's signature sweet, nostalgic aesthetic. The collection features bow-adorned denim, cropped vegan-fur jackets, low-rise carpenter jeans, and playful reinventions of Gap's signature pieces.",
    activation: "Launched with an animated short film 'Sandy's Dream Closet' by visual artist Annie Choi, set above Liang's father's Cantonese restaurant, Congee Village. Collection ranges from $15 clear tote bags to $268 reversible leather-sherpa jackets, with online-exclusive baby and toddler styles.",
    url: "https://wwd.com/business-news/retail/gap-sandy-liang-collaboration-reimagining-gap-icons-downtown-edge-1238271666/",
    category: "Designer Collaboration"
  },
  {
    id: 3,
    brand: "Zara",
    title: "50th Anniversary Campaign & Collection",
    date: "May 9, 2025",
    location: "Global - First Store Renovation in A Coruña, Spain",
    description: "Zara celebrated its 50th anniversary with an iconic Steven Meisel-directed campaign featuring 50 of the world's most renowned models including Naomi Campbell, Cindy Crawford, Linda Evangelista, and Christy Turlington. The campaign film features models lip-syncing to Donna Summer's 'I Feel Love' while showcasing a 128-piece monochromatic collection.",
    activation: "The original Zara store in A Coruña was renovated with a unique atmosphere inspired by the city's characteristic galleries. The space now houses a Zacaffé area and library with magazines from May 1975 to present. The campaign collection benefits Women's Earth Alliance through special-edition tees.",
    url: "https://www.hollywoodreporter.com/lifestyle/shopping/zara-50th-anniversary-collection-campaign-how-to-shop-1236211829/",
    category: "Anniversary Campaign"
  },
  {
    id: 4,
    brand: "Nike",
    title: "Nike Running @ The Corner at Nordstrom NYC",
    date: "Through September 2, 2025",
    location: "Nordstrom NYC Flagship - 57th & Broadway",
    description: "Nike Running took over The Corner shop space at Nordstrom's NYC flagship, featuring a curated selection of performance footwear and apparel including the new road running lineup with Nike Pegasus, Vomero, and Structure categories, plus select women's running apparel and accessories.",
    activation: "The space features community programming throughout the activation including weekly group runs led by Nike Running coaches, recovery workshops with ice baths and stretching tutorials, styling sessions, and customization opportunities.",
    url: "https://wwd.com/footwear-news/shoe-industry-news/nike-running-nordstrom-nyc-pop-up-1238031364/",
    category: "Retail Takeover"
  },
  {
    id: 5,
    brand: "New Balance",
    title: "New Balance @ The Corner at Nordstrom NYC",
    date: "Through August 3, 2025",
    location: "Nordstrom NYC Flagship",
    description: "New Balance took over The Corner shop space at Nordstrom's New York City flagship, featuring a curated selection of shoes, apparel, and accessories for women, men, and kids, highlighting New Balance's latest collections and brand heritage.",
    activation: "Dedicated pop-up shop space with full range of New Balance footwear, apparel, and accessories presented in an immersive branded environment at one of NYC's premier shopping destinations.",
    url: "https://wwd.com/footwear-news/shoe-industry-news/gallery/new-balance-nordstrom-nyc-pop-up-photos-1237799692/",
    category: "Retail Takeover"
  },
  {
    id: 6,
    brand: "Nike",
    title: "Sneakeasy Pop-Ups for Air Max Day",
    date: "March 20-26, 2025",
    location: "New York, Los Angeles, Chicago, Toronto",
    description: "Nike hosted limited invite and RSVP-only consumer pop-ups featuring Nike-inspired artwork and interactive experiences to celebrate the 30th anniversary of Air Max and the fourth annual Air Max Day. Each location offered a unique look at past, present, and future of Air Max shoes.",
    activation: "Installations by local artists in each city inspired by Air Max silhouettes. Featured the new VaporMax shoes with giant screens, futuristic mirror backdrops, and opportunities to purchase or customize Nike Air VaporMax through NikeiD. Guests won golden tickets from Nike's branded Air Max Bus.",
    url: "https://www.bizbash.com/experiential-marketing/see-inside-nike-s-shoe-inspired-pop-ups",
    category: "Anniversary Event"
  },
  {
    id: 7,
    brand: "Prada",
    title: "A Winter's Tale Holiday Campaign",
    date: "Holiday 2025",
    location: "Global Campaign",
    description: "Prada's Holiday 2025 campaign directed by Glen Luchford stars Maya Hawke, Damson Idris, Louis Partridge, Letitia Wright, and Li Xian as a chosen family on a wintry adventure. The cinematic campaign captures a journey through snow and memory, weaving narrative and fashion together.",
    activation: "Film and photography campaign showcasing Holiday 2025 collection including sleek bucket bags, ultra-chic ballet flats, quilted chore coats, nylon and leather backpacks, vintage-inspired shoulder bags, luxury accessories, and cold-weather essentials like refined gloves and scarves.",
    url: "https://schonmagazine.com/prada-holiday-2025-campaign-a-winters-tale/",
    category: "Holiday Campaign"
  },
  {
    id: 8,
    brand: "Tory Burch",
    title: "Holiday 2025 Campaign at The Grill",
    date: "Holiday 2025",
    location: "The Grill, Seagram Building, NYC",
    description: "Tory Burch's Holiday 2025 campaign photographed by Oliver Hadlee Pearch features models Alex Consani and Yasmin Wijnaldum at The Grill, the iconic mid-century landmark in the Seagram Building. The campaign captures festive chaos and joyful energy with karaoke, tree-carrying, and party scenes.",
    activation: "Campaign showcases holiday-ready fashion including the Romy and Kira bags, mini Fleming Hobo, Pierced bag with beaded fringe, and various gift-worthy accessories. The shoot transforms the formal Four Seasons location into a glamorous, festive playground.",
    url: "https://schonmagazine.com/tory-burch-the-holiday-2025-campaign/",
    category: "Holiday Campaign"
  },
  {
    id: 9,
    brand: "Coach",
    title: "Coach House Holiday Celebration",
    date: "December 7-8, 2025 (extended through Dec 29)",
    location: "Coach 5th Avenue Flagship, NYC",
    description: "Coach partnered with the Fifth Avenue Association for a free holiday event featuring complementary vintage photo booth, live jazz band, and hot cocoa. Customers who purchased items over $250 received custom engraved ornaments from an on-site artist.",
    activation: "Multi-day holiday activation with live entertainment, complimentary refreshments, photo opportunities, and personalization services. The event celebrated Coach's recent celebrity endorsements and showcased signature pieces like the Tabby and Brooklyn Shoulder Bags.",
    url: "https://www.thezoereport.com/fashion/holiday-fashion-pop-ups-nyc",
    category: "Holiday Event"
  },
  {
    id: 10,
    brand: "Adidas CLOT",
    title: "First Adidas CLOT Pop-Up Store in London",
    date: "July 4-13, 2025",
    location: "London",
    description: "The first adidas CLOT pop-up store in London offered an exclusive experience during Wimbledon, featuring the collaboration between adidas and Hong Kong streetwear brand CLOT with special releases and brand activations.",
    activation: "Limited-time pop-up coinciding with Wimbledon tennis championship, offering exclusive adidas CLOT collaborative products and immersive brand experience for sneaker enthusiasts and tennis fans.",
    url: "https://news.adidas.com/global/the-first-adidas-clot-pop-up-store-in-london-is-offering-an-exclusive-experience-during-wimbledon-fr/s/7c341a9d-a11c-4bd2-8994-7d5c243c17f6",
    category: "Collaboration Pop-Up"
  },
  {
    id: 11,
    brand: "Adidas x Qias Omar",
    title: "LA Superstar Launch at Los Feliz Vintage Flea Market",
    date: "October 2025",
    location: "Los Feliz Vintage Flea Market, Los Angeles",
    description: "Adidas celebrated the launch of content creator Qias Omar's first collaboration with a pop-up at the Los Feliz Vintage Flea Market. The LA Superstar features washed black upper with vintage tee aesthetic, cracked leather stripes, shirt tag on tongue, off-white coloring, and multiple insoles and lace options.",
    activation: "Pop-up featured music, tacos, unique shopping experience, and celebration of Omar's decade-long journey in sneaker culture and content creation. The vintage-inspired design includes custom palm tree logo from adidas archives.",
    url: "https://officemagazine.net/adidas-superstar-gets-vintage-la-remix",
    category: "Product Launch"
  },
  {
    id: 12,
    brand: "Marc Jacobs",
    title: "Joy at The Corner at Nordstrom NYC",
    date: "September 6 - October 5, 2025",
    location: "Nordstrom NYC - 57th & Broadway",
    description: "Marc Jacobs partnered with Nordstrom for an immersive pop-up experience at The Corner featuring a limited-edition capsule collection exploring the intersection of art and fashion through visual storytelling and expressive design themed around JOY.",
    activation: "Dedicated Corner takeover with Marc Jacobs limited-edition pieces, special events with RSVPs, and an immersive branded environment celebrating the vibrant expression of joy through fashion and art.",
    url: "https://nycplugged.com/nyfw-september-2025-pop-ups-parties-shows-and-more/",
    category: "Designer Takeover"
  },
  {
    id: 13,
    brand: "Nana Jacqueline",
    title: "First NYC Pop-Up in SoHo",
    date: "November 2024 - January 14, 2025",
    location: "414 West Broadway, SoHo, NYC",
    description: "Los Angeles-based luxury fashion brand Nana Jacqueline opened its first-ever NYC pop-up featuring ultra-feminine, vintage-inspired designs. The brand is beloved by celebrities including Ariana Grande, Blackpink members, Jenna Ortega, and Kacey Musgraves.",
    activation: "The space features Nana Jacqueline's signature blush pink aesthetic, emulating an elegant luxury boutique with vintage charm. Houses Autumn/Winter 2024 and Holiday 2024 collections along with best-selling pieces curated for the holiday season.",
    url: "https://us.fashionnetwork.com/news/Nana-jacqueline-opens-first-nyc-pop-up-in-soho,1678253.html",
    category: "Holiday Pop-Up"
  },
  {
    id: 14,
    brand: "A.P.C. x Marc Jacobs",
    title: "Fall 2025 Collaboration",
    date: "October 2, 2025",
    location: "Global Launch",
    description: "Marc Jacobs and A.P.C. debuted a fall 2025 collaboration rooted in the friendship between Jacobs and Jean Touitou (founder of A.P.C.) since the 1990s. The collection reimagines collegiate style with autumn must-haves.",
    activation: "Collection features varsity jackets, dual-branded jerseys, Marc Jacobs' signature Tote Bag, and accessories with subtle nods to both labels including orange accents referencing Jacobs' 1980s Paris transit pass and Touitou's Sorbonne student card.",
    url: "https://www.thezoereport.com/fashion/october-2025-fashion-news",
    category: "Designer Collaboration"
  },
  {
    id: 15,
    brand: "Gymshark",
    title: "Holiday Pop-Up in SoHo",
    date: "November 2024 - January 2025",
    location: "SoHo, NYC",
    description: "Fitness brand Gymshark opened a holiday pop-up featuring best-selling athleisure, accessories, and exercise equipment with discounted items, exclusive merchandise, and giveaways.",
    activation: "Features athlete meet-and-greets with Gymshark ambassadors including Whitney Simmons and Diana Conforti. The space includes monochrome holiday decorations perfect for photo-ops and showcases the brand's latest fitness essentials.",
    url: "https://www.thezoereport.com/fashion/holiday-fashion-pop-ups-nyc",
    category: "Holiday Pop-Up"
  },
  {
    id: 16,
    brand: "Pleasing (Harry Styles)",
    title: "Holiday Hub Pop-Up",
    date: "Holiday 2024/2025",
    location: "SoHo NYC & Los Angeles",
    description: "Harry Styles' wellness label Pleasing opened Holiday Hub pop-ups presenting the brand's entire assemblage in a whimsical, Styles-inspired environment blending into the bustling streets but offering an immersive experience inside.",
    activation: "Full product range including nail polish, candles, perfumes, lip balms, keychains, and outerwear all available in one location. The space features distinctive Pleasing branding and experiential elements.",
    url: "https://www.thezoereport.com/fashion/holiday-fashion-pop-ups-nyc",
    category: "Holiday Pop-Up"
  },
  {
    id: 17,
    brand: "Loewe",
    title: "Qixi AR Experience",
    date: "Chinese Valentine's Day (Qixi) 2025",
    location: "Digital/AR Campaign",
    description: "Loewe introduced an adorable AR experience with delightful AR filters to celebrate Chinese Valentine's Day (Qixi). Users could snap moments with loved ones using a cuddly hedgehog filter symbolizing love, along with butterfly and star filters.",
    activation: "AR filters available in dual-shot modes or solo shots, allowing users to record meaningful moments. The hedgehog symbolization of love made Qixi more fun and interactive through digital technology.",
    url: "https://tryon.kivisense.com/blog/brand-activation/",
    category: "Digital Activation"
  },
  {
    id: 18,
    brand: "Tommy Hilfiger x JISOO",
    title: "A Hilfiger Holiday Campaign",
    date: "Holiday 2025",
    location: "Global Campaign",
    description: "Tommy Hilfiger unveiled its 'A Hilfiger Holiday' campaign featuring global brand ambassador and BLACKPINK member JISOO. The vibrant campaign celebrates the season while remixing tradition with festive sparkle and modern prep style.",
    activation: "Campaign captures the season in full swing from touchdowns in the snow to puppies wrapped in ribbon. JISOO showcases elevated winter looks bringing festive energy to the brand's modern prep aesthetic in cozy, feminine but confident styling.",
    url: "https://schonmagazine.com/tory-burch-the-holiday-2025-campaign/",
    category: "Holiday Campaign"
  },
  {
    id: 19,
    brand: "Jimmy Choo",
    title: "Winter 2025 Collection",
    date: "Winter 2025",
    location: "Global Launch",
    description: "Jimmy Choo's Winter 2025 collection presents jewel-like heirlooms for women and reimagined timeless masculine classics. The collection is designed to elevate the everyday and transform the festive season.",
    activation: "Features the iconic Saeda pump with signature delicate crystal chain, jewel-like crystal detailing, playful ribbons, and enriched textures. Each piece designed as an heirloom in the making celebrating the spirit of giving.",
    url: "https://schonmagazine.com/tory-burch-the-holiday-2025-campaign/",
    category: "Collection Launch"
  },
  {
    id: 20,
    brand: "Tiffany & Co.",
    title: "Love is a Gift Holiday Campaign",
    date: "Holiday 2025",
    location: "Global Campaign",
    description: "Tiffany & Co.'s 2025 holiday campaign titled 'Love is a Gift' stars house ambassador Anya Taylor-Joy. The campaign reaffirms Tiffany's status as the quintessential gifting destination and its role in expressions of love.",
    activation: "Photographed by Carlijn Jacobs, Taylor-Joy wears simple black ensembles to showcase iconic Tiffany pieces. Campaign features the iconic Tiffany blue box in varying sizes, suggesting an array of gifting options.",
    url: "https://www.wmagazine.com/fashion/best-holiday-2025-campaigns",
    category: "Holiday Campaign"
  },
  {
    id: 21,
    brand: "Bergdorf Goodman",
    title: "The Bergdorf Soirée Holiday Campaign",
    date: "Holiday 2025",
    location: "Bergdorf Goodman, NYC",
    description: "Bergdorf Goodman's holiday campaign 'The Bergdorf Soirée' focuses on often-overlooked moments throughout the holidays. Stars Linda Fargo, Willy Chavarria, Maggie Maurer, and artists Cacho Falcon, Quentin Jones, and Bernard Maisner.",
    activation: "Campaign showcases fashion from Marc Jacobs, Tom Ford, and Schiaparelli with vignettes of holiday preparations. Features last-minute phone chats, party outfit try-ons, and glimpses of the many gifting options available at the luxury retailer.",
    url: "https://www.wmagazine.com/fashion/best-holiday-2025-campaigns",
    category: "Holiday Campaign"
  },
  {
    id: 22,
    brand: "Tyler, the Creator x Converse",
    title: "Archival Silhouettes Collection & LA Pop-Up",
    date: "June 12-20, 2025",
    location: "Los Angeles Pop-Up, then Converse Website",
    description: "Tyler, the Creator's latest Converse collection ushers in the return of two archival silhouettes in seven colorways releasing simultaneously. Prior to the online release on June 20, a Los Angeles pop-up opened June 12.",
    activation: "Exclusive LA pop-up gave fans first access to the collection before global online release. Featured Tyler's signature design aesthetic across multiple Converse archival models.",
    url: "https://wwd.com/footwear-news/sneaker-news/sneaker-release-date-calendar-june-2025-1237875104/",
    category: "Collaboration Launch"
  },
  {
    id: 23,
    brand: "Loro Piana",
    title: "Holiday 2025 Collection",
    date: "Holiday 2025",
    location: "Global Launch",
    description: "Loro Piana's Holiday 2025 collection embraced its roots with masterfully crafted, classically sophisticated pieces that are cozy and chic. The collection utilizes cable-knit, mohair, and cashmere textures inspired by après-ski aesthetics.",
    activation: "Collection features day-to-dark versatility with neutral and brown-adjacent hues plus muted greens inspired by NYC during the holiday season. Focus on sepia-toned holiday nostalgia and exceptional Italian craftsmanship.",
    url: "https://sia-news.com/all-of-the-2025-holiday-campaigns-shaping-the-season/",
    category: "Collection Launch"
  },
  {
    id: 24,
    brand: "Zara",
    title: "50 Creatives Anniversary Collection",
    date: "October 6, 2025",
    location: "Zara.com & Select Stores",
    description: "For its 50th anniversary, Zara enlisted 50 creative friends across different fields to create pieces encapsulating Zara's spirit. Collaborators include Rosalía, Es Devlin, Marc Newson, Alexandre De Betak, Naomi Campbell, Nick Knight, Pat McGrath, and Vincent Van Duysen.",
    activation: "Eclectic limited-edition collection features fashion, accessories, furniture, and design objects. Includes a hot pink surfboard, dog jumpers, glass vessels, and various artistic interpretations. Showcases Zara's evolution from fashion retailer to leading lifestyle brand.",
    url: "https://www.wallpaper.com/design-interiors/zara-50-anniversary-collection",
    category: "Anniversary Collection"
  },
  {
    id: 25,
    brand: "Bella Hadid - Ôrəbella",
    title: "Ôrəbella Pop-Up Experience",
    date: "September 2025 (NYFW)",
    location: "Brooklyn, NYC",
    description: "Bella Hadid's fragrance brand Ôrəbella hosted a pop-up during New York Fashion Week offering branded gifts, Eternal Roots samples, custom compact mirror engravings, and special drinks and treats.",
    activation: "Interactive Brooklyn pop-up gave fans hands-on experience with the fragrance brand, personalization options, and exclusive limited items available while supplies lasted.",
    url: "https://fashionista.com/2025/09/new-york-fashion-week-nyfw-free-events-open-to-public-september-2025",
    category: "Brand Launch"
  },
  {
    id: 26,
    brand: "Brandon Maxwell x Walmart",
    title: "NYFW Pop-Up Experience",
    date: "September 12-21, 2025",
    location: "401 West 14th Street, NYC",
    description: "Brandon Maxwell and Walmart teamed up for a pop-up experience featuring pieces from Scoop, Free Assembly, Avia, and No Boundaries. Maxwell reimagined a black blazer from his Spring 2016 line for Scoop for the 10th anniversary of his label.",
    activation: "Shoppable pop-up celebrating designer collaboration with accessible fashion retailer, featuring exclusive anniversary piece alongside Walmart fashion brands during New York Fashion Week.",
    url: "https://fashionista.com/2025/09/new-york-fashion-week-nyfw-free-events-open-to-public-september-2025",
    category: "Designer Collaboration"
  },
  {
    id: 27,
    brand: "Jenni Kayne",
    title: "NYFW Cocktail Hour & Pop-Up",
    date: "September 19-20, 2025",
    location: "125 Greene Street, SoHo, NYC",
    description: "Jenni Kayne celebrated the end of NYFW with a cocktail hour featuring live jazz, free martinis and french fries, and conversations with Jenni Kayne's creative partners. The following day featured a pop-up with branded coffee cups and complimentary mini croissants.",
    activation: "Two-day activation combining evening entertainment with daytime shopping experience, showcasing fall arrivals in Jenni Kayne's signature California-cool aesthetic.",
    url: "https://fashionista.com/2025/09/new-york-fashion-week-nyfw-free-events-open-to-public-september-2025",
    category: "Fashion Week Event"
  },
  {
    id: 28,
    brand: "Tecovas",
    title: "Western Dance Hall & Grand Opening",
    date: "September 8-14, 2025",
    location: "Grand Central Vanderbilt Hall & NYC Store",
    description: "In celebration of their largest store to date, Texas boot brand Tecovas transformed Grand Central Vanderbilt Hall into a Great Western Dance Hall, bringing a taste of the West to New York City during Fashion Week.",
    activation: "Multi-location grand opening events featuring Western-themed experiences, live music, and celebration of cowboy boot culture in Manhattan's iconic transportation hub.",
    url: "https://nycplugged.com/nyfw-september-2025-pop-ups-parties-shows-and-more/",
    category: "Store Opening"
  },
  {
    id: 29,
    brand: "Ksubi x Alice Hollywood",
    title: "Limited-Edition Capsule Pop-Up",
    date: "September 11-14, 2025",
    location: "Ksubi NYC Store",
    description: "Australian denim brand Ksubi teamed up with streetwear label Alice Hollywood to create a limited-edition 14-piece capsule collection, offering consumers first look and shopping opportunity during a limited-time pop-up at Ksubi's NYC location.",
    activation: "Exclusive pop-up featuring the full collaborative collection with streetwear and denim pieces blending both brands' aesthetics during New York Fashion Week.",
    url: "https://fashionista.com/2025/09/new-york-fashion-week-nyfw-free-events-open-to-public-september-2025",
    category: "Collaboration Pop-Up"
  },
  {
    id: 30,
    brand: "Louis Vuitton",
    title: "La Beauté Louis Vuitton Pop-Up",
    date: "August 30 - December 31, 2025",
    location: "NYC",
    description: "Louis Vuitton opened an extended beauty pop-up in New York City showcasing the La Beauté Louis Vuitton line including fragrances, cosmetics, and luxury beauty products.",
    activation: "Long-term pop-up installation allowing customers to explore and experience the full Louis Vuitton beauty range in an immersive branded environment throughout the fall and holiday season.",
    url: "https://www.averagesocialite.com/fashion-beauty",
    category: "Beauty Pop-Up"
  },
  {
    id: 31,
    brand: "Minnie Rose x Zibby Media",
    title: "Holiday Pop-Up Bookstore",
    date: "October 15, 2025 - January 15, 2026",
    location: "NYC",
    description: "Cashmere brand Minnie Rose partnered with Zibby Media for a holiday pop-up bookstore combining cozy fashion with literary culture, creating a unique shopping and browsing experience.",
    activation: "Multi-month pop-up merging fashion retail with bookstore atmosphere, featuring Minnie Rose's cashmere collection alongside curated book selections perfect for holiday gifting.",
    url: "https://www.averagesocialite.com/fashion-beauty",
    category: "Collaboration Pop-Up"
  },
  {
    id: 32,
    brand: "Gucci",
    title: "Gucci Altitude Winter Sportswear Launch",
    date: "Winter 2025",
    location: "Global Campaign - Filmed in the Alps",
    description: "Gucci makes its debut in winter sportswear with Gucci Altitude, fronted by tennis champion Jannik Sinner and filmed high in the Alps. The collection represents Gucci's entry into the performance winter sports category.",
    activation: "Cinematic campaign featuring professional athlete Jannik Sinner showcasing technical outerwear and accessories designed for alpine activities while maintaining Gucci's luxury aesthetic.",
    url: "https://thefashionography.com/fashion/fashion-campaigns/",
    category: "Product Launch"
  },
  {
    id: 33,
    brand: "Bottega Veneta x Jacob Elordi",
    title: "What are Dreams Film Campaign",
    date: "2025",
    location: "Global Campaign",
    description: "Bottega Veneta paired brand ambassador Jacob Elordi with photographer Duane Michals for a project titled What are Dreams, featuring Elordi reading poetry in an artistic film exploring creative expression.",
    activation: "Art film campaign blending fashion with literature and poetry, showcasing Bottega Veneta's commitment to cultural storytelling beyond traditional fashion advertising.",
    url: "https://thefashionography.com/fashion/fashion-campaigns/",
    category: "Brand Campaign"
  },
  {
    id: 34,
    brand: "JW Anderson",
    title: "Loafer Bag Campaign with John Malkovich",
    date: "2025",
    location: "Global Campaign",
    description: "John Malkovich stars in JW Anderson's new Loafer Bag campaign, bringing character and gravitas to the brand's latest accessory launch with his distinctive presence and acting prowess.",
    activation: "Celebrity-driven campaign featuring acclaimed actor John Malkovich, positioning the new Loafer Bag as a statement piece with cultural credibility and artistic merit.",
    url: "https://thefashionography.com/fashion/fashion-campaigns/",
    category: "Product Launch"
  },
  {
    id: 35,
    brand: "Fendi x Yuna Shin",
    title: "Spring 2026 Pre-Collection Campaign",
    date: "2025",
    location: "Global Campaign",
    description: "Yuna Shin stars in Fendi's Spring Summer 2026 pre-collection campaign captured with a disco-inspired mood, bringing vibrant energy and dance floor glamour to the Italian luxury house's latest collection.",
    activation: "Disco-themed campaign photography showcasing Fendi's pre-collection with model Yuna Shin, blending retro dance culture with contemporary luxury fashion.",
    url: "https://thefashionography.com/fashion/fashion-campaigns/",
    category: "Collection Campaign"
  },
  {
    id: 36,
    brand: "Salomon x JJJJound",
    title: "XT-6 Collaboration Announcement",
    date: "2025",
    location: "Global Launch",
    description: "Montreal-based creative studio JJJJound and outdoor brand Salomon officially announced their XT-6 project, bringing JJJJound's minimalist design philosophy to Salomon's iconic trail running silhouette.",
    activation: "Collaboration launch featuring JJJJound's signature refined aesthetic applied to Salomon's technical footwear, appealing to both fashion and outdoor enthusiasts.",
    url: "https://hypebeast.com/2025/7/best-sneaker-releases-july-2025-week-5-nike-new-balance",
    category: "Collaboration Launch"
  },
  {
    id: 37,
    brand: "Krispy Kreme x Crocs",
    title: "Glazed Classic Clog",
    date: "2025",
    location: "Global Launch",
    description: "Krispy Kreme and Crocs collaborated on a glazed Classic Clog design inspired by Krispy Kreme's iconic glazed donuts, bringing playful food-inspired design to the popular clog silhouette.",
    activation: "Limited-edition collaboration featuring donut-inspired colorway and details on Crocs Classic Clog, merging food culture with footwear fashion.",
    url: "https://hypebeast.com/2025/7/best-sneaker-releases-july-2025-week-5-nike-new-balance",
    category: "Collaboration Launch"
  },
  {
    id: 38,
    brand: "Cav Empt x Nike",
    title: "Air Max DN8 Fall/Winter 2025",
    date: "Fall/Winter 2025",
    location: "Global Launch",
    description: "Japanese streetwear brand Cav Empt teased three takes on the Nike Air Max DN8 in its Fall/Winter 2025 lookbook, marking a new chapter in the ongoing partnership between the brands.",
    activation: "Lookbook debut featuring three colorways of the Air Max DN8 with Cav Empt's signature utilitarian and technical design language.",
    url: "https://hypebeast.com/2025/7/best-sneaker-releases-july-2025-week-5-nike-new-balance",
    category: "Collaboration Preview"
  },
  {
    id: 39,
    brand: "Nike x Bronx Girls Skate",
    title: "SB Dunk Low Collaboration",
    date: "2025",
    location: "Global Launch",
    description: "Nike partnered with Bronx Girls Skate organization on an SB Dunk Low collaboration celebrating women in skateboarding and the Bronx skate community's culture and impact.",
    activation: "Community-focused collaboration using the SB Dunk Low as canvas to highlight Bronx Girls Skate's mission of empowering young women through skateboarding.",
    url: "https://hypebeast.com/2025/7/best-sneaker-releases-july-2025-week-5-nike-new-balance",
    category: "Community Collaboration"
  },
  {
    id: 40,
    brand: "Abercrombie & Fitch",
    title: "NFL Official Fashion Partner",
    date: "2025",
    location: "National Partnership",
    description: "Abercrombie & Fitch announced it would be the NFL's official fashion partner, marking a major brand partnership bringing Abercrombie's style sensibility to professional football culture.",
    activation: "Multi-year partnership with increased marketing investments supporting the NFL collaboration, positioning Abercrombie & Fitch within sports and lifestyle culture.",
    url: "https://digiday.com/marketing/in-earnings-reports-fashion-brands-clock-fallout-from-tariffs-and-tease-holiday-plans/",
    category: "Brand Partnership"
  },
  {
    id: 41,
    brand: "Anthropologie x Camila Mendes",
    title: "First Major Campaign Under New CMO",
    date: "2025",
    location: "National Campaign",
    description: "Anthropologie announced its collaboration with actress Camila Mendes for its first big campaign under a new chief marketing officer, signaling a fresh creative direction for the lifestyle brand.",
    activation: "Celebrity partnership and campaign launch marking new era of Anthropologie marketing with focus on reaching contemporary consumers through influencer and celebrity collaborations.",
    url: "https://digiday.com/marketing/in-earnings-reports-fashion-brands-clock-fallout-from-tariffs-and-tease-holiday-plans/",
    category: "Brand Campaign"
  },
  {
    id: 42,
    brand: "Gap x Katseye",
    title: "Global Pop Group Collaboration",
    date: "2025",
    location: "National Campaign",
    description: "Gap partnered with global pop group Katseye for a major campaign ahead of the holiday season, combining music culture with fashion to drive customer acquisition and brand relevance.",
    activation: "Splashy campaign featuring K-pop/pop group Katseye as part of Gap's pre-holiday push with outsized marketing investments to increase customer acquisition into Q4.",
    url: "https://digiday.com/marketing/in-earnings-reports-fashion-brands-clock-fallout-from-tariffs-and-tease-holiday-plans/",
    category: "Music Collaboration"
  }
];

const getScreenshotUrl = (event) => {
  return `/screenshots/event-${event.id}.jpg`;
};

const PresentationDeck = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [filter, setFilter] = useState('All');
  const [imageErrors, setImageErrors] = useState({});
  const [imageLoaded, setImageLoaded] = useState({});

  const categories = ['All', ...new Set(events.map(e => e.category))];
  const filteredEvents = filter === 'All' ? events : events.filter(e => e.category === filter);
  const totalSlides = filteredEvents.length + 1;

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const handleImageError = (eventId, event) => {
    console.error(`Failed to load screenshot for event ${eventId}:`, event);
    setImageErrors(prev => ({ ...prev, [eventId]: true }));
  };

  const handleImageLoad = (eventId) => {
    setImageLoaded(prev => ({ ...prev, [eventId]: true }));
  };

  const TitleSlide = () => (
    <div className="h-full flex flex-col justify-center items-center bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white p-12">
      <h1 className="text-6xl font-bold mb-6 text-center">Fashion & Shoe Retail</h1>
      <h2 className="text-4xl font-light mb-8 text-center">Brand Activation Events 2025</h2>
      <div className="text-xl text-gray-300 mb-8">Holiday Season Focus</div>
      <div className="text-lg text-gray-400">{events.length} Brand Activations Documented</div>
      <div className="text-sm text-gray-500 mt-8">With Campaign Screenshots</div>
    </div>
  );

  const EventSlide = ({ event }) => (
    <div className="h-full bg-white overflow-y-auto">
      <div className="max-w-6xl mx-auto p-8">
        {/* Screenshot Section */}
        <div className="mb-6 bg-gray-100 rounded-lg overflow-hidden shadow-lg">
          <div className="relative w-full" style={{ minHeight: '400px' }}>
            {!imageErrors[event.id] ? (
              <>
                {!imageLoaded[event.id] && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                    <div className="text-center p-4">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
                      <p className="text-gray-600">Loading screenshot...</p>
                    </div>
                  </div>
                )}
                <img
                  src={getScreenshotUrl(event)}
                  alt={`${event.brand} - ${event.title}`}
                  className={`w-full h-auto ${imageLoaded[event.id] ? 'opacity-100' : 'opacity-0'}`}
                  onError={(e) => handleImageError(event.id, e)}
                  onLoad={() => handleImageLoad(event.id)}
                  loading="lazy"
                />
              </>
            ) : (
              <div className="w-full h-96 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                <div className="text-center p-8">
                  <div className="mb-4 text-gray-400">
                    <svg className="w-20 h-20 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-gray-600 font-semibold mb-4">{event.brand}</p>
                  <p className="text-gray-500 text-sm mb-4">Screenshot preview unavailable</p>
                  <a
                    href={event.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Campaign Page
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Content Section */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">{event.brand}</h2>
            <h3 className="text-xl text-gray-700 mb-4">{event.title}</h3>
          </div>
          <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold whitespace-nowrap">
            {event.category}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
          <div>
            <span className="font-semibold text-gray-600">Date:</span>
            <p className="text-gray-900">{event.date}</p>
          </div>
          <div>
            <span className="font-semibold text-gray-600">Location:</span>
            <p className="text-gray-900">{event.location}</p>
          </div>
        </div>

        <div className="mb-6">
          <h4 className="font-semibold text-gray-700 mb-2">Event Description</h4>
          <p className="text-gray-800 leading-relaxed">{event.description}</p>
        </div>

        <div className="mb-6">
          <h4 className="font-semibold text-gray-700 mb-2">Brand Activation Details</h4>
          <p className="text-gray-800 leading-relaxed">{event.activation}</p>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <a
            href={event.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            View Source Article
          </a>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full h-screen flex flex-col bg-gray-100">
      {/* Filter Bar */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="max-w-7xl mx-auto flex flex-wrap gap-2">
          <span className="text-sm font-semibold text-gray-700 flex items-center mr-4">Filter:</span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setFilter(cat);
                setCurrentSlide(0);
              }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filter === cat
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Slide Area */}
      <div className="flex-1 relative overflow-hidden">
        {currentSlide === 0 ? (
          <TitleSlide />
        ) : (
          <EventSlide event={filteredEvents[currentSlide - 1]} />
        )}
      </div>

      {/* Navigation Controls */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={prevSlide}
            className="flex items-center px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Previous
          </button>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              Slide {currentSlide + 1} of {totalSlides}
            </span>
            <span className="text-xs text-gray-500">
              ({filteredEvents.length} events)
            </span>
          </div>

          <button
            onClick={nextSlide}
            className="flex items-center px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Next
            <ChevronRight className="w-5 h-5 ml-1" />
          </button>
        </div>
      </div>

      {/* Slide Indicators */}
      <div className="bg-gray-50 py-3 overflow-x-auto">
        <div className="flex justify-center gap-2 px-4 min-w-max mx-auto">
          {Array.from({ length: totalSlides }).map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                currentSlide === index
                  ? 'bg-blue-600 w-8'
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PresentationDeck;
