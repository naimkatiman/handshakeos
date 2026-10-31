import { mkdir, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';

// Original vector artwork. One light source, bevel, and material palette across the site.
// Sharp ships with Next.js; no extra package is required to export the browser icons.
const sharp = createRequire(import.meta.url)('sharp');
const defs = `<defs>
  <linearGradient id="mint" x1="0" y1="0" x2=".85" y2="1" gradientUnits="objectBoundingBox"><stop stop-color="#dcfff0"/><stop offset=".42" stop-color="#6ce5c2"/><stop offset="1" stop-color="#249c83"/></linearGradient>
  <linearGradient id="ivory" x1="0" y1="0" x2=".8" y2="1"><stop stop-color="#fffef5"/><stop offset=".55" stop-color="#e5ede6"/><stop offset="1" stop-color="#a6c4bf"/></linearGradient>
  <linearGradient id="navy" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#41586a"/><stop offset=".45" stop-color="#253b4a"/><stop offset="1" stop-color="#12212f"/></linearGradient>
  <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fff0bd"/><stop offset=".5" stop-color="#f4c66e"/><stop offset="1" stop-color="#b2782d"/></linearGradient>
  <linearGradient id="edge" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#268d78"/><stop offset="1" stop-color="#103c3a"/></linearGradient>
  <linearGradient id="glass" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#b0ffe5" stop-opacity=".36"/><stop offset="1" stop-color="#4fd1ae" stop-opacity=".06"/></linearGradient>
  <radialGradient id="halo"><stop stop-color="#4fd1ae" stop-opacity=".22"/><stop offset="1" stop-color="#4fd1ae" stop-opacity="0"/></radialGradient>
  <filter id="shadow" x="-50%" y="-50%" width="200%" height="240%"><feGaussianBlur stdDeviation="8"/></filter>
</defs>`;
const shadow = '<ellipse cx="121" cy="207" rx="71" ry="13" fill="#020b12" opacity=".3" filter="url(#shadow)"/>';
const path = (d, fill, extra = '') => `<path d="${d}" fill="${fill}" ${extra}/>`;
const line = (d, stroke = '#fff', width = 2, extra = '') => `<path d="${d}" fill="none" stroke="${stroke}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;
const solid = (d, material = 'mint', depth = 10, edge = '#176653') =>
  `<g transform="translate(0 ${depth})">${path(d, edge)}</g>` +
  `<g transform="translate(0 ${depth / 2})">${path(d, edge)}</g>` +
  path(d, `url(#${material})`, 'stroke="#effff5" stroke-opacity=".45" stroke-width="1.2" stroke-linejoin="round"');
const check = (x, y, size = 1, color = '#113f36') => `<g transform="translate(${x} ${y}) scale(${size})">${line('M-17 0 -4 13 21-16', color, 8)}</g>`;
const sheet = 'M64 37H159Q174 37 174 52V168Q174 182 159 182H64Q49 182 49 167V52Q49 37 64 37Z';
const shield = 'M120 36C139 48 159 55 183 59V115C183 152 158 182 120 199C82 182 57 152 57 115V59C81 55 101 48 120 36Z';
const brandH = 'M65 57H88V104H151V57H174V177H151V128H88V177H65Z';

const artwork = {
  brand: `<rect x="26" y="25" width="188" height="188" rx="51" fill="#09161d"/>
    ${solid('M26 72Q26 25 73 25H167Q214 25 214 72V166Q214 213 167 213H73Q26 213 26 166Z', 'navy', 7, '#0b1720')}
    <g transform="rotate(-8 120 120)">${solid(brandH, 'mint', 9)}
    ${path('M120 104H151V57H174V177H151V128H120Z', 'url(#ivory)')}
    ${line('M67 174V59H86M91 106H149M153 59H172', '#fff', 2, 'opacity=".65"')}</g>`,
  conversation: `<g transform="rotate(-12 120 120)">
    ${solid('M84 47H182Q198 47 198 63V119Q198 135 182 135H164L144 151V135H84Q68 135 68 119V63Q68 47 84 47Z', 'ivory', 9, '#688b88')}
    ${line('M91 70H169M91 85H152', '#6d9187', 7)}
    ${solid('M43 103H139Q156 103 156 120V162Q156 180 139 180H76L54 198V180H43Q27 180 27 164V120Q27 103 43 103Z', 'mint', 10)}
    <g fill="#176451"><circle cx="60" cy="140" r="6"/><circle cx="90" cy="140" r="6"/><circle cx="120" cy="140" r="6"/></g>
    ${line('M40 107H137', '#effff6', 2, 'opacity=".75"')}</g>`,
  capture: `<g transform="rotate(-10 120 120)">
    <g transform="translate(20 13) rotate(10 111 113)">${solid(sheet, 'navy', 8, '#11212d')}</g>
    ${solid(sheet, 'ivory', 9, '#6d8d85')}
    <circle cx="79" cy="76" r="14" fill="url(#mint)"/>
    ${line('M107 67H151M107 79H140M70 111H152M70 129H136M70 147H119', '#6c8980', 6)}
    ${line('M39 74V46Q39 28 56 28H82M146 28H169Q184 28 184 45V66M184 146V174Q184 191 167 191H149M77 191H54Q39 191 39 177V158', '#5fe0b9', 5)}
    <circle cx="177" cy="166" r="25" fill="#166b58"/>
    <circle cx="177" cy="160" r="25" fill="url(#mint)" stroke="#d5ffef"/>
    ${line('M177 149V171M166 160H188', '#164e3e', 5)}</g>`,
  evidence: `<g transform="rotate(-9 120 120)">
    ${solid(shield, 'navy', 12, '#0e2630')}
    ${solid('M120 53C136 63 150 68 168 72V115C168 142 150 166 120 182C90 166 72 142 72 115V72C90 68 104 63 120 53Z', 'mint', 5)}
    ${path('M120 57C103 66 87 72 75 74V113C75 139 91 163 120 179Z', '#effff2', 'opacity=".15"')}
    ${check(119, 114, 1.2)}
    ${line('M80 76C96 72 108 66 119 60', '#f5fff7', 2, 'opacity=".8"')}</g>`,
  partnership: `<g transform="rotate(-32 120 120)">
    ${solid('M50 62H118Q145 62 145 89V123Q145 150 118 150H50Q23 150 23 123V89Q23 62 50 62ZM53 85Q46 85 46 93V119Q46 127 53 127H115Q122 127 122 119V93Q122 85 115 85Z', 'ivory', 12, '#597d77')}
    ${solid('M121 96H189Q216 96 216 123V157Q216 184 189 184H121Q94 184 94 157V123Q94 96 121 96ZM124 119Q117 119 117 127V153Q117 161 124 161H186Q193 161 193 153V127Q193 119 186 119Z', 'mint', 12)}
    ${path('M122 89Q122 85 115 85H98V62H118Q145 62 145 89V123H122Z', 'url(#ivory)')}
    ${line('M48 65H118Q141 65 142 89M123 99H188Q211 99 213 121', '#f6fff4', 2, 'opacity=".85"')}</g>`,
  launch: `<g transform="rotate(24 120 120)">
    ${solid('M85 128C62 130 48 147 45 178L88 160ZM155 128C178 130 192 147 195 178L152 160Z', 'navy', 8, '#112632')}
    ${solid('M120 24C88 48 78 79 78 120L94 163H146L162 120C162 79 152 48 120 24Z', 'ivory', 10, '#71938b')}
    ${path('M120 24C103 36 91 52 85 72H155C149 52 137 36 120 24Z', 'url(#mint)')}
    <circle cx="120" cy="100" r="24" fill="#809c95"/><circle cx="120" cy="97" r="20" fill="url(#navy)" stroke="#eafff3" stroke-width="3"/>
    ${line('M110 88Q119 80 129 90', '#75cbb5', 2)}
    ${solid('M105 173H135L142 199L120 222L98 199Z', 'gold', 5, '#976a2b')}
    ${path('M120 174H128L131 194L120 208L109 194L112 174Z', '#fff2bf')}
    ${line('M97 153H143', '#95b6aa', 3)}</g>`,
  network: `<circle cx="118" cy="112" r="77" fill="#103e38" transform="translate(0 11)"/>
    <circle cx="118" cy="112" r="77" fill="url(#mint)" stroke="#c4ffe9" stroke-width="1.5"/>
    <g fill="none" stroke="#176652" stroke-width="3" opacity=".6"><ellipse cx="118" cy="112" rx="37" ry="76"/><ellipse cx="118" cy="112" rx="76" ry="29"/><path d="M42 112H194M118 36V188"/></g>
    <path d="M63 64C77 48 99 40 117 40" fill="none" stroke="#ecfff4" stroke-width="4" stroke-linecap="round" opacity=".7"/>
    <ellipse cx="118" cy="112" rx="107" ry="36" transform="rotate(-29 118 112)" fill="none" stroke="#647e8d" stroke-width="7"/>
    <path d="M25 157C58 178 157 132 207 70" fill="none" stroke="url(#ivory)" stroke-width="7" stroke-linecap="round"/>
    <circle cx="204" cy="73" r="13" fill="#966d30"/><circle cx="204" cy="69" r="13" fill="url(#gold)"/>`,
  outcomes: `<g transform="translate(-8 0)">
    ${solid('M47 139 82 120 116 138 82 157Z', 'mint', 49)}
    ${path('M47 139 82 157V199L47 181Z', '#18765f')}${path('M82 157 116 138V180L82 199Z', '#124d43')}
    ${solid('M91 103 126 84 160 102 126 121Z', 'mint', 72)}
    ${path('M91 103 126 121V189L91 171Z', '#258c70')}${path('M126 121 160 102V170L126 189Z', '#14604f')}
    ${solid('M135 58 170 39 204 57 170 76Z', 'ivory', 118, '#496f66')}
    ${path('M135 58 170 76V185L135 167Z', '#b0cbbf')}${path('M170 76 204 57V166L170 185Z', '#6c9e8f')}
    ${line('M43 109 84 91 119 58 169 20M146 22 171 18 172 43', '#f1c875', 6)}
    ${line('M48 139 82 157 115 139M92 103 126 121 159 103M136 58 170 76 202 59', '#f5fff5', 1.5, 'opacity=".7"')}</g>`,
  mail: `<g transform="rotate(-11 120 120)">
    <g transform="translate(36 15) rotate(13 110 110)">${solid('M45 65H175Q189 65 189 79V161Q189 175 175 175H45Q31 175 31 161V79Q31 65 45 65Z', 'navy', 10, '#102331')}</g>
    ${solid('M35 70H183Q199 70 199 86V167Q199 183 183 183H35Q19 183 19 167V86Q19 70 35 70Z', 'mint', 12)}
    ${path('M22 86 97 139Q110 149 123 139L196 86V166Q196 180 182 180H36Q22 180 22 166Z', '#299f81')}
    ${path('M23 165 83 122 99 136Q110 145 121 136L139 122 196 165Q196 180 183 180H36Q23 180 23 165Z', 'url(#mint)')}
    ${solid('M36 71H182Q193 71 196 82L122 135Q110 144 98 135L22 82Q25 71 36 71Z', 'ivory', 4, '#83aa98')}
    ${line('M30 80 100 131Q110 138 120 131L188 80', '#fffef3', 2, 'opacity=".8"')}
    <circle cx="181" cy="58" r="27" fill="#997536"/><circle cx="181" cy="52" r="27" fill="url(#gold)" stroke="#fff1ba"/>
    ${line('M169 53H193M183 44 193 53 183 62', '#684e25', 4)}</g>`,
  checklist: `<g transform="rotate(-9 120 120)">
    ${solid('M62 43H167Q183 43 183 59V183Q183 199 167 199H62Q46 199 46 183V59Q46 43 62 43Z', 'navy', 10, '#0e2630')}
    ${solid('M64 56H161Q169 56 169 64V179Q169 187 161 187H64Q56 187 56 179V64Q56 56 64 56Z', 'ivory', 3, '#6a8f83')}
    ${solid('M94 34H139Q149 34 149 44V59Q149 67 139 67H94Q84 67 84 59V44Q84 34 94 34Z', 'mint', 5)}
    <circle cx="116" cy="43" r="5" fill="#36765d"/>
    <g fill="#40b88c"><rect x="73" y="89" width="19" height="19" rx="5"/><rect x="73" y="124" width="19" height="19" rx="5"/><rect x="73" y="159" width="19" height="19" rx="5" opacity=".3"/></g>
    ${line('M78 97 82 101 88 93M78 132 82 136 88 128', '#f6fff4', 2.5)}
    ${line('M104 95H147M104 104H135M104 130H147M104 139H127M104 165H137', '#6c8b7f', 4)}
    <g transform="rotate(23 178 147)">${solid('M171 90H184V183L177 198 171 183Z', 'gold', 5, '#8b632a')}${path('M171 183H184L177 198Z', '#f2ead1')}${path('M175 193H180L177 198Z', '#183528')}</g></g>`,
  calendar: `<g transform="rotate(-10 120 120)">
    ${solid('M51 55H183Q199 55 199 71V179Q199 195 183 195H51Q35 195 35 179V71Q35 55 51 55Z', 'ivory', 11, '#557f70')}
    ${path('M51 55H183Q199 55 199 71V93H35V71Q35 55 51 55Z', 'url(#mint)')}
    ${line('M39 94H195', '#276951', 2)}
    ${line('M76 42V65M155 42V65', '#143e37', 13)}${line('M74 40V61M153 40V61', '#d8f5df', 6)}
    <g fill="#719382"><rect x="61" y="111" width="18" height="14" rx="4"/><rect x="98" y="111" width="18" height="14" rx="4"/><rect x="136" y="111" width="18" height="14" rx="4"/><rect x="61" y="144" width="18" height="14" rx="4"/><rect x="98" y="144" width="18" height="14" rx="4"/></g>
    <circle cx="173" cy="166" r="35" fill="#8a672e"/><circle cx="173" cy="159" r="35" fill="url(#gold)" stroke="#ffefb2" stroke-width="2"/>
    ${line('M173 138V160L187 167', '#715027', 5)}<circle cx="173" cy="160" r="4" fill="#715027"/></g>`,
  search: `<g transform="rotate(-10 120 120)">
    <g transform="translate(-5 0) scale(.88)">${solid(sheet, 'ivory', 8, '#6b9285')}${line('M70 69H146M70 88H129M70 112H144M70 132H120', '#7c9b8f', 6)}</g>
    <g transform="rotate(-37 156 163)">${solid('M142 142H167V211Q167 218 159 218H150Q142 218 142 211Z', 'navy', 7, '#102631')}${path('M143 184H166V207H143Z', 'url(#mint)')}</g>
    <circle cx="128" cy="115" r="61" fill="#175a4b" transform="translate(0 9)"/>
    <circle cx="128" cy="115" r="60" fill="url(#mint)" stroke="#d6ffeb" stroke-width="1.5"/>
    <circle cx="128" cy="115" r="43" fill="url(#navy)" stroke="#163e37" stroke-width="4"/>
    ${path('M95 96Q126 63 160 99L108 139Q92 121 95 96Z', '#7de9c5', 'opacity=".2"')}
    ${line('M106 113H148M106 125H135', '#91d1b6', 5)}${line('M99 86Q119 70 140 77', '#f5fff5', 3, 'opacity=".75"')}</g>`,
  archive: `<g transform="translate(1 -7)">
    ${solid('M37 118 116 84 205 118 205 181 121 216 37 182Z', 'mint', 6)}
    ${path('M37 118 121 153V216L37 182Z', '#217b61')}${path('M121 153 205 118V181L121 216Z', '#16503f')}
    ${solid('M55 64 105 44 133 55 133 119 81 142 55 130Z', 'ivory', 6, '#8aac99')}
    ${solid('M91 47 121 35 177 57V137L121 158 91 145Z', 'ivory', 7, '#7c9c8b')}
    ${path('M100 68 120 61 167 78V89L120 72 100 80Z', '#86ac95')}
    ${path('M100 91 120 84 167 101V111L120 94 100 102Z', '#86ac95')}
    ${solid('M28 121 115 86 214 120 127 158Z', 'mint', 12, '#1b604b')}
    ${path('M29 123 127 162V176L29 137Z', '#71d9ae')}${path('M127 162 214 124V139L127 176Z', '#247659')}
    ${line('M66 165 96 177', '#c0f5d8', 6)}${line('M32 123 126 160 210 125', '#ddffe9', 2)}</g>`,
  alert: `<g transform="rotate(-8 120 120)">
    ${solid('M108 44Q119 26 130 44L212 178Q224 197 202 197H36Q14 197 26 178Z', 'gold', 12, '#895f28')}
    ${path('M110 59Q119 44 128 59L195 171Q201 183 188 183H50Q37 183 44 171Z', 'url(#navy)')}
    ${solid('M111 86H129L126 138H114Z', 'gold', 3, '#91722d')}
    <circle cx="120" cy="158" r="9" fill="url(#gold)"/>
    ${line('M30 181 111 48', '#fff0c4', 2, 'opacity=".75"')}</g>`,
  compass: `<g transform="rotate(-14 120 120)">
    <circle cx="120" cy="125" r="82" fill="#8a662a"/><circle cx="120" cy="116" r="82" fill="url(#gold)" stroke="#ffefb8" stroke-width="2"/>
    <circle cx="120" cy="116" r="68" fill="url(#navy)" stroke="#5b795f" stroke-width="2"/>
    ${line('M120 56V68M120 164V176M60 116H72M168 116H180', '#e2e6c9', 3)}
    ${line('M79 76 86 83M154 150 162 158M79 156 86 149M154 83 161 76', '#98b6a2', 2)}
    ${solid('M148 72 127 126 92 160 111 106Z', 'mint', 5, '#163f36')}
    ${path('M127 126 92 160 111 106 119 115Z', 'url(#ivory)')}
    <circle cx="120" cy="116" r="9" fill="url(#gold)" stroke="#fff0c1"/>
    ${line('M65 82Q89 45 135 49', '#fff0c7', 2, 'opacity=".8"')}</g>`,
  receipt: `<g transform="rotate(-10 120 120)">
    <g transform="translate(18 10) rotate(8 120 120)">${solid(sheet, 'navy', 8, '#0c2631')}</g>
    ${solid('M66 34H155L185 65V190L171 180 157 191 142 180 127 191 112 180 97 191 82 180 66 191 51 180V49Q51 34 66 34Z', 'ivory', 9, '#6c9586')}
    ${path('M154 35V58Q154 66 162 66H185Z', 'url(#mint)')}
    ${path('M73 79H93V96H82Q83 104 92 107V114Q72 110 72 94ZM107 79H127V96H116Q117 104 126 107V114Q106 110 106 94Z', '#25906f')}
    ${line('M73 133H157M73 148H146M73 163H126', '#739784', 5)}
    ${line('M62 39H151', '#fffef6', 2)}</g>`,
};

function svg(body, width = 240, height = 240) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${defs}${width === 240 ? shadow : ''}${body}</svg>\n`;
}

await mkdir('public/visuals', { recursive: true });
for (const [name, body] of Object.entries(artwork)) await writeFile(`public/visuals/${name}.svg`, svg(body));

const proof = `<ellipse cx="317" cy="391" rx="225" ry="27" fill="#01090d" opacity=".4" filter="url(#shadow)"/>
  <ellipse cx="323" cy="232" rx="256" ry="194" fill="url(#halo)"/>
  <g fill="none" stroke="#4fd1ae" stroke-opacity=".2"><ellipse cx="327" cy="305" rx="256" ry="80" transform="rotate(-13 327 305)"/><ellipse cx="327" cy="305" rx="206" ry="59" transform="rotate(-13 327 305)"/></g>
  <g transform="translate(178 79) rotate(-14 120 120) scale(1.48)">
    <g transform="translate(25 22) rotate(9 120 120)">${solid(sheet, 'navy', 10, '#0a1925')}</g>
    ${solid(sheet, 'ivory', 10, '#6a9187')}
    ${line('M71 67H147M71 85H130M71 112H147M71 130H140M71 148H114', '#739289', 6)}
    <rect x="64" y="102" width="91" height="20" rx="4" fill="#52c79d" fill-opacity=".3"/>
  </g>
  <g transform="translate(20 103) scale(.8)">${artwork.conversation}</g>
  <g transform="translate(352 163) scale(1.12)">${artwork.evidence}</g>
  <g transform="translate(436 50) scale(.38)">${artwork.partnership}</g>
  <circle cx="180" cy="88" r="6" fill="url(#gold)"/><circle cx="507" cy="355" r="5" fill="url(#mint)"/>
  ${line('M172 300C139 347 241 403 353 347', '#75dbbc', 2, 'stroke-dasharray="5 8" opacity=".6"')}`;
await writeFile('public/visuals/proof.svg', svg(proof, 640, 480));

const briefing = `<ellipse cx="317" cy="395" rx="234" ry="25" fill="#02100c" opacity=".25" filter="url(#shadow)"/>
  <ellipse cx="316" cy="260" rx="255" ry="177" fill="url(#halo)"/>
  <path d="M119 303C162 414 484 415 541 261" fill="none" stroke="#78bc9f" stroke-width="2" stroke-dasharray="6 10" opacity=".55"/>
  <g transform="translate(30 168) scale(.9)">${artwork.calendar}</g>
  <g transform="translate(164 24) scale(1.55)">${artwork.checklist}</g>
  <g transform="translate(363 162) scale(1.05)">${artwork.mail}</g>
  <circle cx="95" cy="133" r="7" fill="url(#gold)"/><circle cx="533" cy="121" r="6" fill="url(#mint)"/>
  ${line('M531 48V67M521 57H541', '#acdfc0', 3)}
  <circle cx="326" cy="421" r="4" fill="#8cd7b3"/>`;
await writeFile('public/visuals/briefing.svg', svg(briefing, 640, 480));

// Simplify the same H silhouette for a favicon that survives 16px rasterization.
const icon = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><defs><linearGradient id="m" x2=".8" y2="1"><stop stop-color="#afffe0"/><stop offset="1" stop-color="#35b692"/></linearGradient><linearGradient id="b" x2="1" y2="1"><stop stop-color="#2a4250"/><stop offset="1" stop-color="#0b171e"/></linearGradient></defs><rect x="1" y="1" width="62" height="62" rx="16" fill="url(#b)" stroke="#597c7b"/><path d="M15 16H25V30H40V16H50V51H40V39H25V51H15Z" fill="#0a322e"/><path d="M15 13H25V27H40V13H50V48H40V36H25V48H15Z" fill="url(#m)"/><path d="M33 27H40V13H50V48H40V36H33Z" fill="#f2f4e9"/></svg>\n`;
await writeFile('app/icon.svg', icon);
await sharp(Buffer.from(icon)).resize(180, 180).png().toFile('app/apple-icon.png');
const sizes = [16, 32, 48];
const pngs = await Promise.all(sizes.map(size => sharp(Buffer.from(icon)).resize(size, size).png().toBuffer()));
const header = Buffer.alloc(6 + sizes.length * 16);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(sizes.length, 4);
let offset = header.length;
pngs.forEach((png, i) => {
  const entry = 6 + i * 16;
  header[entry] = sizes[i];
  header[entry + 1] = sizes[i];
  header.writeUInt16LE(1, entry + 4);
  header.writeUInt16LE(32, entry + 6);
  header.writeUInt32LE(png.length, entry + 8);
  header.writeUInt32LE(offset, entry + 12);
  offset += png.length;
});
await writeFile('app/favicon.ico', Buffer.concat([header, ...pngs]));
console.log(`Generated ${Object.keys(artwork).length + 2} SVG assets, SVG favicon, 16/32/48px ICO, and 180px Apple icon.`);
